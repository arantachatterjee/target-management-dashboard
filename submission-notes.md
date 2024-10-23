# Add any notes about the task here

## Bonus Tasks

### TASK 1: Design the strategy to manage and track changes to the pipeline statuses of targets. Consider the database schema, data update strategy, etc.

It is important to log the history of target pipeline status changes. In addition to the Targets table, the database should have a table which maintains these logs.

Based on the Targets table schema, we can design the logs table schema as well.

**Targets Table**

Table Name: targets

- id (Primary Key, Number): Unique identifier for each target.
- name (String): Name of the target.
- description (Text): Description of the target.
- pipeline_status (String): Current pipeline status of the target.
- markets (JSON or String): List of markets associated with the target.
- last_updated (Timestamp): UTC (ISO 8601 format) Date and time of the status change.

**Pipeline Status Change Logs Tablle**

Table Name: pipeline_status_change_logs

- id (Primary Key, Number): ID for each status change entry.
- acquisition_target_id (Foreign Key, Integer): References the target in the Targets table.
- old_pipeline_status (String): Status before the update.
- new_pipeline_status (String): Status after the update.
- updated_by (String): User ID of the platform end user who made the change.
- updated_at (Timestamp): UTC (ISO 8601 format) Date and time of the status change.

**Data Update Strategy**

Database
- When a user updates a targeted company's pipeline status, a new row will be created in the `pipeline_status_change_logs` table which will save the target's UUID in the acquisition_target_id column, it will save the old_pipeline_status status and new new_pipeline_status which the user selected. 
  - The updated_by field will save the User ID of the user who is logged in (presuming that the dashboard will require login prior to use).
  - The updated_at field will be updated to save today's date.
- Next, the `targets` table will be updated to reflect the new pipeline_status.
- If one of the above two database queries fail, then the data will be in an inconsistent state so these would ahve to be run sequentially in a transaction and if either of them fails, the transaction will be rolledback.
- As a best practice, all SQL queries must have their corresponding roll-back queries in a ROLLBACK transaction operation as well to allow undoing any unintentional changes.

User Interface
- When the update API returns a 200 OK response, a success message is shown to the end user
- If the API fails and does not return a sucecssful 200 OK response, a failure message will be shown to the end user, requesting them to try again or contact support if the issue persists
- Additionally, a separate page can be created for the dashboard which displays the pipeline change history of each company. It can have a global filter which allows viewing the change history of all companies or the selected company
- Further UI / UX improvements for the Dashboard page can include an `Edit` button in place of a drop down menu of pipeline statuses. When the user clicks the Edit button for the target row, a new `Edit Pipeline Status` modal can be displayed which displayed old status and then requests the end user to select the new status.

Rollback Startegy
- In case, the pipeline_status was changed unintentionally, a roll-back mechanism must exist to undo the change. An `Undo` button can be added to the UI which allows reverting the status update.

**Data Management Strategy**

As the data grows, historical records can be moved into a cloud-based data warehouse for further data analysis and reporting needs.

### TASK 2: Identify any non-trivial edge cases with the implemented features and how you would handle them.

Error and Exception Handling
- There is room to make the code more resilient by adding further exception handling scenarios to the GET targets API similar to the new PUT target API.
- I have currently not handled error cases when the PUT target API responds with a response code other than 200 OK. A failure modal would have to be created to show the appropriate failure response similar to how the success response is being displayed currently, to handle edge cases where the API returns a 404, 504 or 500 (common responses when there are internet connectivity or network latency issues).

Database Race Conditions
A common production issue is a race condition, when two or more users attempt to update the same database record at the same time. Some of the updates get overwritten this way. The solution is to cache the pipeline status when targets are fetched from the database on the UI, prior to running the UPDATE SQL query, the PUT API will check if the target's status has changed. If yes, it will discard the update, inform the end user via an Info modal that the target's pipeline status has been changed recently by another user, and request them to refresh their page and try again.

Alternatively, a backend queue can be implemented which captures update all the requests sequentially and then the DB updates can be made sequentially be dequeuing update requests from the queue.

Another commonly used approach is DB locking. However, it significantly degrades performance over time as codebases grow so the above approaches are better solutions in the long run.

Pagination
Currently, the mock in-memory database (targets.json) has 30 targets. However, a real database will grow over time so the TargetTable would need to have pagination implemented to handle this situation. For example, when there are more than 50 targets to be displayed on the UI, the table would paginate the responses.

### Additional UI Improvements

Bulk Pipeline Status Updates
An eventual UI improvement would be allowing dashboard users to update pipeline statuses of multiple targets in bulk.

Extend Global Filter To Allow Multi-Select
The global filter can be upgraded to a multi-seletc filter which allows selecting more than one pipeline status at a time as filters.
