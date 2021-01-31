export class Driver {

  constructor(
    public uid: string = '',
    public name: string = '',
    public email: string = '',
    public fiscalNumber: string = '',
    public phoneNumber: string = '',
    public tpa: boolean = false,
    public bag: boolean = false,
    public enabled: boolean = true,
    public area: string = '',
    fcmTokens = [],
  ) { }
}
