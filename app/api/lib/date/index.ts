export default class AppDate {
  date: Date;
  static parse(dateString: string) {
    if (!dateString) {
      return;
    }

    const [year, month, day] = dateString
      .split("-")
      .map((str) => parseInt(str, 10));
    return new AppDate(new Date(year, month - 1, day));
  }

  static in(day: number) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    return new AppDate(date);
  }

  constructor(date = new Date()) {
    this.date = date;
  }

  get cloneDate() {
    return new Date(this.date.getTime());
  }

  toString() {
    const month = (this.date.getMonth() + 1).toString().padStart(2, "0");
    const day = this.date.getDate().toString().padStart(2, "0");

    return `${this.date.getFullYear()}-${month}-${day}`;
  }

  getDateInXMonth(n: number) {
    const date = (this.date.getMonth() + n) % 12;
    const res = new Date(this.cloneDate.setMonth(date));

    return new AppDate(res);
  }

  getTime() {
    return this.date.getTime();
  }

  isAfter(date: AppDate) {
    return this.getTime() > date.getTime();
  }
}
