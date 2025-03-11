export interface LoginCrendentialsType {
    email: string;
    password: string;
}

export interface SocialLogCredentialType {
    name: string,
    email: string,
}

export interface UserGlobalStateType {
    id: string,
    username: string,
    email: string,
    image: string[] | File[],
    phone: string,
    birthday: string,
    lookingFor: string,
    interestedIn: string,
    prime: boolean,
}

export interface SearchFilterSortParams {
    search: string,
    startDate: string,
    endDate: string,
    status: boolean | undefined,
    sortColumn:string,
    sortDirection: string,
    page: number,
    pageSize: number,
}

export interface Filter {
  startDate: string,
  endDate: string,
}

export interface DBD {
  userData:{
    newUsers:{
      count: number
    }[],
    activeUsers:{
      count: number,
    }[],
    primeMembers:{
      count: number,
    }[],
    totalUsers:{
      count: number
    }[],
    monthlyNewUsers:{
      month: string,
      count: number
    }[],
    genderSplit:{
      _id: string,
      count: number
    }[],

  },

  salesData:{
    eventSales:{
      month: string;
      totalSales: number;
      soldSlots: number;
      avgSalesPerMonth: number;
      dailySales:{
        date: string,
        amount: number,
        count: number,
      }[]
    }[],
    subscriptionSales:{
      month: string; planType: string;
      count: number;
      amount: number;
      dailySales:{
        date: string,
        amount: number,
        count: number,
      }[]
    }[],
    totalMonthlySales:{
      month: string;
      totalIncome: number;
    }[],

  },

  employeeData: [{
    totalEmployees:[{
      count: number
    }],
    activeEmployees:[{
      count: number
    }]
  }],

  eventData: [{
    upcomingEvents:number
  }],
};

export interface Report {
  salesData:{
    eventSales:{
      month: string;
      totalSales: number;
      soldSlots: number;
      avgSalesPerMonth: number;
      dailySales:{
        date: string,
        amount: number,
        count: number,
      }[]
    }[],
    subscriptionSales:{
      month: string; planType: string;
      count: number;
      amount: number;
      dailySales:{
        date: string,
        amount: number,
        count: number,
      }[]
    }[],
    totalMonthlySales:{
      month: string;
      totalIncome: number;
    }[]
  }
}

export interface SubscriptionData {
  _id:string,
  planType: string,
  price: string,
  createdAt: string,
  isListed:boolean
}


export interface EmployeeCreateData {
  name: string,
  email: string,
}

export interface CategoryCreateData {
  name: string,
}

export type PreferenceData = {
  userId: string | undefined;
  interestedIn: string | undefined;
  ageRange: [number, number] | undefined;
  distance: number | undefined;
  lookingFor: string | undefined;
};

export type SubscriptionPaymentWalletData = {
  purpose: string | undefined;
  userId: string | undefined;
  amount: string | undefined;
  planId: string | undefined;
  planType: string | undefined;
  isPrime: boolean | undefined;
};

 export type SubscriptionPaymentData = {
  currency: string| undefined;
  amount: string| undefined;
  userId: string| undefined;
  planId: string| null;
  planType: string| undefined;
  isPrime: boolean| undefined;
};

export type RazorpaySubscriptionPaymentData = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId: string| undefined;
  amount: number;
  planId: string| undefined;
  planType: string| undefined;
};

export type EventBookingData = {
  purpose: string;
  userId: string| undefined;
  amount: number| undefined;
  currency: string;
  eventId: string| undefined;
  slots: number | undefined; 
};

export type EventPaymentData = {
  currency: string;
  amount: number| undefined;
  userId: string| undefined;
  eventId: string| undefined;
  slots: number | undefined; 
};

export type RazorpayEventPaymentData = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId: string| undefined;
  amount: number| undefined;
  currency: string| undefined;
  eventId: string| undefined;
  slots: number | undefined; 
};

export type RazorpayWalletPaymentData = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId: string| undefined;
  amount: number| undefined;
  description: string;
}


export interface ChangePasswordData {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
}

export interface EventData {
  _id: string,
  title: string,
  description: string,
  image: string[],
  location: string,
  locationURL: string,
  slots: number,
  totalEntries: number,
  price: number,
  eventDate: string,
  createdAt: string,
}



export interface AdvertisementData {
  id: string,
  title: string,
  subtitle: string,
  content:string,
  image?:string,
  isListed: boolean,
  createdAt: string,
}


export type AdvertisementFormData = {
  title: string;
  subtitle: string;
  content: string;
  images: File[];
};



export interface Advertisement {
  advertisement:{
    id: string
    title: string
    subtitle: string
    content: string
    image: string[]
    createdAt: string
  }[]
}

export interface UserDTO {
  _id: string
  username: string
  email: string
  password?: string
  phone?: string
  dob?: string
  gender?: string
  interestedIn?: string
  lookingFor?: string
  isBlocked?: boolean
  image?: string[]
  setupCompleted?: boolean
  createdAt?: string | Date
}
