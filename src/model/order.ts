import { EasypayPayment } from './easypay-payment';
import { User } from './user';
import { Shop } from './shop';
import { Address } from './submodels/address';
import { OrderItem } from './order-item';

export class Order {

  constructor(
    public uid: string = '',
    public type: 'take-away' | 'delivery' = 'delivery',
    public status: string = '',
    public log: string[] = [],
    public shop: Shop = new Shop(),
    public user: User = new User(),
    public orderItems: OrderItem[] = [],
    public address: Address = null,
    public submittedAt: string = '',
    public completedAt: string = '',
    public arrivalExpectedAt: string = '',
    public subTotal: number = 0,
    public total: number = 0,
    public paid: boolean = false,
    public paymentMethod: '' | 'mb' | 'mbw' | 'payment-on-delivery' = '',
    public easypayPayment: EasypayPayment = {} as EasypayPayment,
    public easypayPaymentId: string = ''
  ) {}

}
