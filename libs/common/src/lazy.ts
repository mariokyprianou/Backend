export interface ILazyInitializer<T> {
  (): Promise<T>;
}

export class Lazy<T> {
  private instance: T | null = null;
  private initializer: ILazyInitializer<T>;

  constructor(initializer: ILazyInitializer<T>) {
    this.initializer = initializer;
  }

  public async get(): Promise<T> {
    if (this.instance == null) {
      this.instance = await this.initializer();
    }

    return this.instance;
  }
}
