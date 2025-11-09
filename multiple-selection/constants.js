const LANGUAGE_CODE = document.documentElement.dataset.lang;

const FETCHXML_RESULTS = {};

const GLOBAL_VARIABLES = {
    borderRardius: '6px',
    inputHeight: '32px',
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