import { Option } from './option';

export class OrderOption extends Option {
  
  constructor(
    public quantity: number = 0,
  ) {
    super();
  }
  
}
