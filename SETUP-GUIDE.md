# Set Up Predictive Analytics for Clinical Service Requests

**Health Cloud · Data Cloud Scoring Framework**
_Setup guide — current as of 2026-10-19_

This guide walks through setting up predictive referral scoring for Clinical
Service Requests (CSR) in Health Cloud, end to end: installing the data kit,
installing the Scoring Framework template, and enabling the writeback that puts
the score back on the CSR record.

> This is a community setup guide, not an official Salesforce publication.

**Required editions:** Health Cloud with Data Cloud provisioned, and the
Scoring Framework (Data Cloud) enabled.

The score is a **predicted likelihood of referral acceptance**, learned from
your historical Clinical Service Requests. It is not a clinical quality score
and is not a measure of care appropriateness.

---

## The pipeline, end to end

```
CRM (Clinical Service Request)
   → Data Cloud DMOs (via the data kit)        ← Step 1
   → Training data transform + model            ← Step 2
   → Scoring data transform (predicted scores)
   → Writeback to the CSR "Referral Score"      ← Step 3
```

---

## Prerequisites

Before you start, confirm all of the following.

**Data**
- **Clinical Service Request records exist in your CRM.** The model trains on
  these records.
- The **Clinical Service Request DMO has at least 400 rows** after the data
  streams run. An empty or sparse DMO fails the Step 2 readiness check.
- The data has a **mix of accepted and not-accepted requests.** If every request
  has the same outcome, the model can't learn to tell them apart (this warns at
  readiness; it doesn't hard-block).

**Permissions (admin running the setup)**
- Data Cloud admin access (to deploy data kits and run the Scoring Framework).
- Setup access to manage permission sets and users (for Step 3).

---

## Step 1 — Install the Health Cloud Scoring data kit

The scoring model doesn't read your CRM directly — it reads **Data Model Objects
(DMOs)** in Data Cloud. The data kit defines the data streams that bring
`ClinicalServiceRequest` and its related objects from the CRM into those DMOs.
Without it, the DMOs the model expects are missing or empty, and Step 2 fails
its readiness checks.

**What the data kit contains.** The **Health Cloud Scoring** data kit (the
stream bundle is named **CSRScore**) creates four data streams:

| Source object | Target DMO |
|---|---|
| Clinical Service Request | `ClinicalServiceRequestDmo` |
| Clinical Service Request Detail | `ClinicalServiceRequestDetailDmo` |
| Diagnostic Summary | `DiagnosticSummaryDmo` |
| Health Condition | `PatientHealthConditionDmo` |

Diagnostic Summary and Health Condition supply the optional model features. If
you don't map that data, those features are simply empty and the install still
succeeds.

> **The acceptance field is mapped for you.** The Clinical Service Request stream
> includes a formula field that converts the request's `IsAccepted` value into
> the `IsAccepted` field on the DMO as a boolean. The default training label
> reads that field.

**Deploy it**
1. From Setup, go to **Data Cloud Setup** and select **Data Kits**.
2. Select **Health Cloud Scoring**.
3. Review the contents, then click **Data Kit Deploy**.
4. Select the **data space** to deploy into, and enter your **org ID**.
5. Click **Deploy**.
6. Wait for the deployment to finish. Track progress on the **Deployment History** tab.

**Verify the DMO field mappings.** From the App Launcher, open **Data Streams**,
confirm each stream is mapped to its DMO, then check these fields.

_Clinical Service Request DMO (`ssot__ClinicalServiceRequest__dlm`) — required:_

| Field | API name | Used for |
|---|---|---|
| Id | `ssot__Id__c` | Record identifier — readiness check and writeback match key |
| Priority | `ssot__ClinicalServiceRequestPriority__c` | Feature (always included); readiness |
| Start Date | `ssot__ClinicalServiceRequestStartDate__c` | Request-age feature (always included); readiness |
| Status | `ssot__ClinicalServiceRequestStatus__c` | Training label (Active/Completed fallback) |
| Type | `ssot__ClinicalServiceRequestType__c` | "Include Clinical Service Request Type" feature |
| Accepted | `ssot__IsAccepted__c` | Training label (boolean) |
| Diagnostic Summary Id | `ssot__DiagnosticSummaryId__c` | "Include Has Diagnostic Summary" feature |
| Patient Health Condition Id | `ssot__PatientHealthConditionId__c` | "Include Has Patient Health Condition" feature |

_Diagnostic Summary DMO (`ssot__DiagnosticSummary__dlm`) — optional:_

| Field | API name | Used for |
|---|---|---|
| Diagnostic Summary Category | `ssot__DiagnosticSummaryCategory__c` | "Include Diagnostic Summary Category" feature |

_Patient Health Condition DMO (`ssot__PatientHealthCondition__dlm`) — optional:_

| Field | API name | Used for |
|---|---|---|
| Health Condition Severity | `ssot__HealthConditionSeverity__c` | "Include Patient Health Condition Severity" feature |

The Clinical Service Request Detail stream is deployed by the kit but isn't read
by the scoring model, so it has no fields to verify here.

> **Confirm data is flowing before Step 2.** Mapping the streams isn't enough —
> the DMOs must contain rows. After the streams run, confirm the
> `ClinicalServiceRequest` DMO has at least 400 records.

---

## Step 2 — Install the Predictive Analytics for Clinical Service Requests template

1. From Setup, go to **Scoring Framework**.
2. Find and install the **Predictive Analytics for Clinical Service Requests** template.
3. Step through the install wizard and set the parameters below. Each has a default.

**Data Space** _(optional; default: `default`)_ — the Data Cloud data space the
model reads from and writes to. Set it to the same data space you deployed the
data kit into in Step 1.

**Features** — each is a toggle telling the model it may use that signal.
Priority and request age are always included.

| Parameter | Default | Notes |
|---|---|---|
| Include Clinical Service Request Type | On | Uses the request Type as a feature |
| Include Has Diagnostic Summary | On | Flag from the request's own lookup |
| Include Has Patient Health Condition | On | Flag from the request's own lookup |
| Include Diagnostic Summary Category | On | Needs Diagnostic Summary data mapped; empty if absent |
| Include Patient Health Condition Severity | On | Needs Patient Health Condition data mapped; empty if absent |

**Custom filters** _(all optional; default blank)_ — SQL expressions applied to
the Clinical Service Request source. Leave blank to score all requests.
- **Custom Filter logic** — applied to both training and scoring transforms.
- **Custom Filter logic (Training)** — training transform only.
- **Custom Filter logic (Scoring)** — scoring transform only.

**Target Variable** — defines the **training label**, the outcome the model
learns to predict. Default is referral acceptance:

| Sub-field | Default | Meaning |
|---|---|---|
| Label | `Derived Score` | Display name of the predicted outcome |
| Field | `DerivedScore__c` | Field holding the derived training outcome |
| Type | `Binary` | Yes/no outcome (accepted vs. not) |
| Success | `1` | Positive outcome (accepted) |
| Failure | `0` | Negative outcome (not accepted) |
| Goal | `Maximize` | Model optimizes for the success outcome |

Default **condition** (classifies a request as accepted when it's marked
accepted _or_ has reached an Active/Completed status):

```sql
CASE
  WHEN ssot__IsAccepted__c = 1 OR ssot__IsAccepted__c = true THEN 1
  WHEN ssot__ClinicalServiceRequestStatus__c IN ('Active', 'Completed') THEN 1
  ELSE 0
END
```

> **The label depends on `IsAccepted` being a real boolean.** If acceptance
> arrives as text instead, the comparison never matches, every row gets label
> `0`, and the model can hang in _Activating_. Step 1's data kit maps it as a
> boolean for you.

**Parameters you don't set** — leave **Train and Deploy** (default on) and the
internal test flag at their defaults.

**Finish and verify.** Complete the wizard; the template installs the model
definition and data transforms, then begins training. Confirm the model reaches
**Active** status. A model stuck in _Activating_ usually means a single-value
training label (see Troubleshooting).

---

## Step 3 — Enable the score writeback (Copy Field Enrichment)

The model writes its score into a Data Cloud DMO
(`ClinicalServiceRequestScoringData`). **Copy Field Enrichment (CFE)** copies
that score back onto the CRM so coordinators can see it. The writeback runs as a
fixed Data Cloud integration user — not as you — so that user needs specific
Health Cloud permissions (Part B).

**Part A — Create the Copy Field Enrichment**
1. In Data Cloud Setup, create a new **Copy Field Enrichment**.
2. Set the **source** to **Clinical Service Request Scoring Data** (the scoring DMO).
3. Set the **target** to **Clinical Service Request**, and map the score to the
   **Referral Score** field. Map the record identifier as the match key so each
   scoring row updates the right request.
4. Save and start the enrichment.

**Part B — Grant the integration user the required permissions.** The writeback
runs as the **Customer 360 Data Platform Integration** user (`cloud@<org>`),
using the `sfdc_a360` permission set. Two things must be true:
1. **Manage Health Cloud** is enabled on the **sfdc_a360** permission set.
2. The **Health Cloud Platform** permission set license is assigned to the
   `cloud@` integration user.

_Anonymous Apex (both grants; no org-specific IDs to paste):_

```apex
// Enable Manage Health Cloud on the Data Cloud integration permission set
PermissionSet a360 = [SELECT Id FROM PermissionSet WHERE Name = 'sfdc_a360' LIMIT 1];
a360.PermissionsManageHealthCloud = true;
update a360;

// Assign the Health Cloud Platform PSL to the cloud@ integration user
User cloudUser = [SELECT Id FROM User WHERE Username LIKE 'cloud@%' AND IsActive = true LIMIT 1];
PermissionSetLicense psl = [SELECT Id FROM PermissionSetLicense
                            WHERE DeveloperName = 'HealthCloudPlatformPsl' LIMIT 1];
if (0 == [SELECT COUNT() FROM PermissionSetLicenseAssign
          WHERE AssigneeId = :cloudUser.Id AND PermissionSetLicenseId = :psl.Id]) {
    insert new PermissionSetLicenseAssign(
        AssigneeId = cloudUser.Id, PermissionSetLicenseId = psl.Id);
}
```

> **Restart the sync after changing permissions.** Permission changes don't apply
> to an already-running enrichment. Do a full **Stop** then **Start** of the sync.

**Verify the writeback**
1. Confirm the **Referral Score** field exists on Clinical Service Request:
   ```sql
   SELECT QualifiedApiName FROM FieldDefinition
   WHERE EntityDefinition.QualifiedApiName = 'ClinicalServiceRequest'
     AND QualifiedApiName LIKE '%Referral%'
   ```
2. After a sync run, confirm scores are landing (use the field API name from above):
   ```sql
   SELECT COUNT(Id) FROM ClinicalServiceRequest WHERE ReferralScore != null
   ```
   A non-zero, growing count means the writeback works end to end.
3. Open a scored Clinical Service Request as a referral coordinator and confirm
   the **Referral Score** is on the page layout and visible to their profile.

---

## Troubleshooting — by installation phase

The install runs as a chain. Identify the phase that failed first.

| # | Phase | Produces |
|---|---|---|
| 1 | Readiness checks | Pass / warning messages |
| 2 | Training data transform (BDT) | `ClinicalServiceRequestTrainingData` DMO |
| 3 | Model container & setup | Model setup |
| 4 | Model training | A trained model version |
| 5 | Model activation | Model status _Active_ |
| 6 | Scoring data transform (BDT) | `ClinicalServiceRequestScoringData` DMO |
| 7 | Writeback (CFE) | **Referral Score** on the CSR |

**Phase 1 — Readiness check fails**
- _DMO not mapped:_ data kit not deployed or streams haven't run. Finish Step 1.
- _Not enough records:_ fewer than 400 rows in the CSR DMO. Confirm streams ran.
- _Needs both outcomes (warning):_ all requests have the same outcome. Populate
  `IsAccepted` or let requests reach Active/Completed. Warns, doesn't block.

**Phase 2 — Training data transform (BDT) fails.** The transform reads specific
DMO fields; if one is unmapped it can error or produce empty output. Confirm
every required CSR DMO field from Step 1 is mapped. (Diagnostic Summary Category
and Health Condition Severity are optional.)

**Phase 2/5 — Field mapping is wrong (the `IsAccepted` type trap).** The label
compares `ssot__IsAccepted__c = true`. If acceptance is mapped as **text**
instead of **boolean**, the comparison never matches and every row gets label
`0` — which later shows up as a model stuck in _Activating_. Confirm with:
```sql
SELECT COUNT(*) FROM ssot__ClinicalServiceRequest__dlm WHERE ssot__IsAccepted__c = true
```
A zero count when you know some were accepted means it's text. The data kit's
formula field fixes this; redeploy Step 1 and Stop/Start the sync if needed.

**Phase 4 — Model training warns / single-class model.** The label has only one
class — either the mapping trap above, or the data genuinely lacks a mix. Fix
the mapping, confirm both outcomes exist, retrain.

**Phase 5 — Model stuck in "Activating".** Usually the all-one-value label
(mapping trap). Fix `IsAccepted`, confirm a mix of outcomes, reinstall/retrain.

**Phase 6 — Scoring transform produces no scores.** The scoring transform only
runs when **Train and Deploy** is on and reads the same CSR DMO fields. Confirm
Train and Deploy stayed on, fields are mapped, and any scoring filter isn't
excluding everything.

**Phase 7 — No "Referral Score" field.** The CFE target mapping was never
created. Create it (Part A), then verify with the FieldDefinition query above.

**Phase 7 — Scores never appear (field exists, count stays 0).** The writeback
integration user lacks Health Cloud access. Complete Part B (Manage Health Cloud
on `sfdc_a360` + Health Cloud Platform PSL on `cloud@`), then Stop/Start the sync.

**A configuration is stuck and can't be deleted.** Configurations can't be
deleted while _Activating_. Resolve activation first (usually the label issue),
then delete; if still wedged, open a support case.

---

_Repo: https://github.com/KopalliAditya/predictive-clinical-service-request ·
Live: https://kopalliaditya.github.io/predictive-clinical-service-request/_
