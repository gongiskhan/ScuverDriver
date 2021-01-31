export interface EasypayPayment {
  
  created_at: string;
  currency: string;
  customer: {
    email: string;
    fiscal_number: string;
    id: string;
    key: string;
    language: string;
    name: string;
    phone: string;
    phone_indicative: string;
  };
  expiration_time: string;
  id: string;
  key: string;
  method: {
    type: 'MB' | 'MBW' | 'CC';
    status: string;
    /** MBW payments only */
    alias?: string;
    /** MB payments only */
    entity?: string;
    /** MB payments only */
    reference?: string;
  };
  /** For paid payments only */
  paid_at: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'deleted';
  /** For paid payments only */
  transactions: any[];
  type: string;
  value: number;
  
}
