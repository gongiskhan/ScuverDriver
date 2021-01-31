export class BookingSettings {
  
  constructor(
    public bookingEnabled: boolean = false,
    public capacity: number = 10,
    public durationTime: string = '01:00'
  ) {}
  
}
