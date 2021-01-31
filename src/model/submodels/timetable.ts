export class Timetable {
  
  constructor(
    public monday: DaySchedule = new DaySchedule(),
    public tuesday: DaySchedule = new DaySchedule(),
    public wednesday: DaySchedule = new DaySchedule(),
    public thursday: DaySchedule = new DaySchedule(),
    public friday: DaySchedule = new DaySchedule(),
    public saturday: DaySchedule = new DaySchedule(),
    public sunday: DaySchedule = new DaySchedule(),
  ) {}
  
}

export class DaySchedule {
  
  constructor(
    public workingPeriods: WorkingPeriod[] = [],
    public isClosed: boolean = false
  ) {}
  
}

export class WorkingPeriod {
  
  constructor(
    public startTime: string,
    public endTime: string
  ) {}
  
}
