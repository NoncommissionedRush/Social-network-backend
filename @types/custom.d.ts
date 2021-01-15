type WithUser<obj, key extends keyof obj, arg> = Omit<obj, key> &
  {
    [T in key]: Exclude<obj[T], arg>;
  };
