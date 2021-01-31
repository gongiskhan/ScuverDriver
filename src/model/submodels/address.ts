export class Address {
  constructor(
    public addressLine1: string = '',
    public addressLine2: string = '',
    public local: string = '',
    public postCode: string = '',
    public coordinates = {latitude: 0, longitude: 0},
  ) {}
}
