export const API = {


  USER_MANAGEMENT: {
    USERS: {
      CREATE: "/users/",
      LIST: "/users/",
      DETAIL: "/users/me/",
    },
    AUTH: {
      LOGIN: "/login/",
      REFRESH: "/refresh/",
    },
    
  },

  ACCOUNT_MANAGEMENT: {
    DETAIL: "/account/",
  },

  TRANSACTIONS: {
    LIST: "/transactions/",
    DEBIT: {
      CREATE: "/transactions/debit/",
      DETAIL: (transactionId) => `/transactions/debit/${transactionId}/`,
    },
    CREDIT: {
      CREATE: "/transactions/credit/",
      DETAIL: (transactionId) => `/transactions/credit/${transactionId}/`,
    },
  },

  CARDS: {
    CREATE: "/card/",
    GET_USER_CARD: "/card/",
    FUND: "/card/fund/",
  },

  QR_CODE: {
    GET: "/qr-code/",
    SCAN: "/scan-qr/",
    SEND_MONEY: "/send-money-via-qr/",
  },

  ANALYTICS: {
    INCOME_EXPENDITURE_ANALYSIS: "/transactions/monthly-comparison/"
  }
  
};
