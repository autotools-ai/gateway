export interface IAuthStrategy {
  validate: (...any: any) => Promise<any>;
}
