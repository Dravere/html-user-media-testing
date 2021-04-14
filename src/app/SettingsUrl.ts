export class SettingsUrl {
  private url: URL;
  constructor(url?: string|URL|undefined) {
    if (!url) {
      this.url = new URL(window.location.href);
    } else if (typeof url === 'string') {
      this.url = new URL(url);
    } else {
      this.url = url;
    }
  }

  getParam(key: string|string[], defaultValue: string|null = null): string|null {
    if (!Array.isArray(key)) {
      key = [key];
    }

    for (const k of key) {
      const value = this.url.searchParams.get(k);
      if (value !== null) {
        return value;
      }
    }

    return defaultValue;
  }

  setParam(key: string, value: string): void {
    this.url.searchParams.set(key, value);
  }

  getJsonParam(key: string|string[], defaultValue: any = null): any {
    const value = this.getParam(key, null);
    if (value === null) {
      return defaultValue;
    }

    return JSON.parse(value);
  }

  setJsonParam(key: string, value: any): void {
    this.setParam(key, JSON.stringify(value));
  }

  getBooleanParam(key: string|string[], defaultValue: boolean|null = null): boolean|null {
    const value = this.getParam(key);
    if (value === null) {
      return defaultValue;
    }

    return value === '1';
  }

  setBooleanParam(key: string, value: boolean): void {
    this.setParam(key, value ? '1' : '0');
  }

  getHref(): string {
    return this.url.href;
  }
}
