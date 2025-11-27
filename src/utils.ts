/**
 * Creates an object that supports both array and object destructuring.
 * @see https://antfu.me/posts/destructuring-with-object-or-array
 */
export function createIsomorphicDestructurable<T extends Record<string, unknown>, A extends readonly unknown[]>(obj: T, arr: A): T & A {
  const clone = { ...obj } as T & A
  Object.defineProperty(clone, Symbol.iterator, {
    enumerable: false,
    value() {
      let index = 0
      return { next: () => ({ value: arr[index++], done: index > arr.length }) }
    },
  })
  return clone
}
