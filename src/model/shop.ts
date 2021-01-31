import { Address } from './submodels/address';
import { BookingSettings } from './submodels/booking-settings';
import { ClosingDays } from './submodels/closing-days';
import { Timetable } from './submodels/timetable';

export class Shop {
  
  constructor(
    public uid: string = '',
    public name: string = '',
    public fiscalNumber: string = '',
    public address: Address = new Address(),
    public phoneNumber: string = '',
    public email: string = '',
    public photoUrl: string = '',
    public foodTypesId: string[] = [],
    public suspendOrders: boolean = false,
    public deliveryEnabled: boolean = true,
    public onlinePaymentStatus: boolean = true,
    public deliveryFee: number = 1.75,
    public preparationTime: string = '00:30',
    public deliveryCoverage: number = 7,
    public timetable: Timetable = new Timetable(),
    // public closingDays: ClosingDays = new ClosingDays(),
    public minimumOrder: number = 5,
    public businessType: 'shop'|'store'|'groceries'|'pharmacy' = 'shop',
    public dinnerDisabled = false,
    public bookingSettings: BookingSettings = new BookingSettings(),
    public iban: string = '',
  ) {}
  
}
