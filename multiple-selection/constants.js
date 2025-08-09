const LANGUAGE_CODE = document.documentElement.dataset.lang;

const FETCHXML_RESULTS = {};

const GLOBAL_VARIABLES = {
    borderRardius: '6px',
    inputMinHeight: '38px',
};

const GLOBAL_MESSAGES = {};

const languageDataMap = {};

const ids = {};

const classes = {};

const selectors = {};

const domElements = {};

const REQUEST_METHOD = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
    GENERIC_ERROR: 'An error occurred. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You do not have permission to perform this action.',
    FORBIDDEN: 'Access to this resource is forbidden.',
    BAD_REQUEST: 'The request was invalid. Please check your input and try again.',
    INTERNAL_SERVER_ERROR: 'An internal server error occurred. Please try again later.',
};

// #region contact
//#endregion

// #region fpt_cancellationpendingreason

// var record;
// record.fpt_reasontext = "qwdfesdgfrhgj"; // Text
// record["fpt_SubmittedBy@odata.bind"] = "/fpt_customusers(0a9a2595-8560-f011-95f3-000d3a08c259)"; // Lookup
// record["fpt_Task@odata.bind"] = "/fpt_tasks(04597908-1b70-f011-b4cd-000d3aa1971f)"; // Lookup
// record.fpt_type = 100000001; // Choice

//#endregion

// #region fpt_customuser

// var record = {};
// record.fpt_name = "qwdqwdqwd"; // Text
// record.fpt_email = "qwdqwd"; // Text
// record.fpt_fullname = "qwdqwd"; // Text
// record.fpt_isactive = true; // Boolean
// record.fpt_phone = "fqwdqw"; // Text
// record.fpt_role = 100000000; // Choice
// record["fpt_SystemUser@odata.bind"] = "/systemusers(8f8e2945-3750-ef11-bfe3-6045bd20a09e)"; // Lookup

// webapi.safeAjax({
// 	type: "POST",
// 	contentType: "application/json",
// 	url: "/_api/fpt_customusers",
// 	data: JSON.stringify(record),
// 	success: function (data, textStatus, xhr) {
// 		var newId = xhr.getResponseHeader("entityid");
// 		console.log(newId);
// 	},
// 	error: function (xhr, textStatus, errorThrown) {
// 		console.log(xhr);
// 	}
// });

// webapi.safeAjax({
// 	type: "DELETE",
// 	url: "/_api/fpt_customusers(75cb8324-8860-f011-95f3-000d3a08c259)",
// 	contentType: "application/json",
// 	success: function (data, textStatus, xhr) {
// 		console.log("Record deleted");
// 	},
// 	error: function (xhr, textStatus, errorThrown) {
// 		console.log(xhr);
// 	}
// });

//#endregion

// #region fpt_duedatechange

// var record = {};
// record["fpt_Task@odata.bind"] = "/fpt_tasks(04597908-1b70-f011-b4cd-000d3aa1971f)"; // Lookup
// record["fpt_ChangedBy@odata.bind"] = "/fpt_customusers(75cb8324-8860-f011-95f3-000d3a08c259)"; // Lookup
// record.fpt_newduedate = new Date("2025-08-03").toISOString(); // Date Time
// record.fpt_oldduedate = new Date("2025-08-03").toISOString(); // Date Time
// record.fpt_reason = "2qwesdfrgtyhfuqwcdqwdqwd"; // Text

//#endregion

// #region fpt_statushistory

// var record = {};
// record["fpt_Task@odata.bind"] = "/fpt_tasks(04597908-1b70-f011-b4cd-000d3aa1971f)"; // Lookup
// record["fpt_ChangedBy@odata.bind"] = "/fpt_customusers(75cb8324-8860-f011-95f3-000d3a08c259)"; // Lookup
// record.fpt_newstatus = 100000001; // Choice
// record.fpt_oldstatus = 100000003; // Choice

//#endregion

// #region fpt_task

// var record = {};
// record["fpt_CreatedBy@odata.bind"] = "/fpt_customusers(0a9a2595-8560-f011-95f3-000d3a08c259)"; // Lookup
// record.fpt_duedate = new Date("2025-08-28").toISOString(); // Date Time
// record["fpt_PersonInCharge@odata.bind"] = "/fpt_customusers(75cb8324-8860-f011-95f3-000d3a08c259)"; // Lookup
// record.fpt_reasoncancelled = "d2dqw"; // Text
// record.fpt_reasonduedatechange = "dqwdqwd"; // Text
// record.fpt_reasonpending = "qwdqwd"; // Text
// record.fpt_startdate = new Date("2025-08-28").toISOString(); // Date Time
// record.fpt_taskname = "qwdqwdqwdqwd"; // Text

//#endregion
