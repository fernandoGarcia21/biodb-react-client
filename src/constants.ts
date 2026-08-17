// This file contains all the constants that are used in the application

//The URL of the backend API
//export const API = 'https://www.littorinadb.com/api'; //PROD
//const API = 'http://10.41.170.35:3000'; WLAN
//const API = 'http://192.168.144.5:3000'; //PHONE
export const API = 'http://localhost:3000';

export const BATCH_TYPE_UPLOAD_ORANISMS_ID = 1;
export const BATCH_TYPE_DELETE_ORANISMS_ID = 2;
export const TRAIT_TYPE_ENVIRONMENT = 3;

export const DATE_FORMAT_TEMPLATE = "DD/MM/YYYY";
export const DATA_TYPE_INTEGER = 1;
export const DATA_TYPE_DECIMAL = 2;
export const DATA_TYPE_TEXT = 3;
export const DATA_TYPE_DATE = 4;

export const LIST_QUERY_OPERATIONS = [
    {name: "default", value: "", showValueComponent: true},
    {name: "=", value: "eq", showValueComponent: true},
    {name: ">", value: "gt", showValueComponent: true},
    {name: "<", value: "lt", showValueComponent: true},
    {name: ">=", value: "ge", showValueComponent: true},
    {name: "<=", value: "le", showValueComponent: true},
    {name: "LIKE", value: "lk", showValueComponent: true},
    {name: "IN", value: "in", showValueComponent: true},
    {name: "IS NULL", value: "nl", showValueComponent: false},
    {name: "IS NOT NULL", value: "nn", showValueComponent: false}
];

//The list of data types and their corresponding input graphic components to be used in the form
export const LIST_DATA_TYPES_COMPONENTS = [
    {id: 0, name: "Default", component: "input"},
    {id: 1, name: "Integer", component: "input"},
    {id: 2, name: "Decimal number", component: "input"},
    {id: 3, name: "Text", component: "input"},
    {id: 4, name: "Date", component: "calendar"},
    {id: 5, name: "Multiple choice", component: "input"},
];

export const LIST_DATA_TYPES_VALIDATIONS = [
    {id: 1, name: "Integer", regex: "^[0-9]+$", message: "Only integer numbers are allowed"},
    {id: 2, name: "Decimal number", regex: "^[0-9]+(\.[0-9]+)?$", message: "Only decimal numbers are allowed"},
    {id: 3, name: "Text", regex: ".*", message: "Any text is allowed"},
    {id: 4, name: "Date", regex: "^[0-9]{2}/[0-9]{2}/[0-9]{4}$", message: "Date format is wrong. It should be DD/MM/YYYY"},
    {id: 5, name: "Multiple choice", regex: ".*", message: "Any text is allowed"},
];

export const LIST_RELATION_DATA_TYPE_OPERATION = [
    {id: 1, operations: ["=", ">", "<", ">=", "<=", "IS NULL", "IS NOT NULL"]},
    {id: 2, operations: ["=", ">", "<", ">=", "<=", "IS NULL", "IS NOT NULL"]},
    {id: 3, operations: ["=", "LIKE", "IS NULL", "IS NOT NULL"]},
    {id: 4, operations: ["=", ">", "<", ">=", "<=", "IS NULL", "IS NOT NULL"]},
    {id: 5, operations: ["IN", "IS NULL", "IS NOT NULL"]},
];

export const LIST_CONDITIONS_QUERY = [
    {name: "AND", value: "INTERSECT"},
    {name: "OR", value: "UNION"},
];


export const USER_STATUS_ACTIVE = 1;
export const USER_STATUS_NEW = 2;
export const USER_STATUS_INACTIVE = 3;

export const USER_LEVEL_ADMIN = 1;
export const USER_LEVEL_LEADER = 2;
export const USER_LEVEL_INVITED = 3;

export const BU_STATUS_SUBMITTED = 1; //Status of the batch upload process when it is submitted and waiting to be processed
export const BU_STATUS_APPROVED = 6; //Status of the batch upload process when it is approved by the curator and ready to be processed
export const BU_STATUS_REJECTED = 7; //Status of the batch upload process when it is rejected by the curator and not processed

//The URL of the backend API for images
export const BACKEND_ENDPOINT_URL_IMAGES = `${API}/images/`;

export const SETTINGS_DB_NAME = 'DB_NAME';
export const SETTINGS_DB_NAME_SUFFIX = 'DB_NAME_SUFFIX';
