import { Item } from './item';

export class Category {
  
  constructor(
    public uid: string = '',
    public shopId: string = '',
    public name: string = '',
    public weekday: number = -1,
    public priority: number = 0,
    public items: Item[] = []
  ) {}
  
}
