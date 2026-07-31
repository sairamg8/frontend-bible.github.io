# 🔷 Classes & OOP: Access Modifiers, Abstract Classes, `implements` & Decorators

## 1. Under-The-Hood Mechanics

TypeScript layers compile-time-only access control and structural contract enforcement on top of JavaScript's native class syntax — with one important exception (`#field`) that is genuinely enforced by the JS engine itself, not just erased at compile time.

```typescript
class Account {
  public balance: number;          // compile-time only — accessible from anywhere, including at runtime via bracket access
  private pin: string;                // compile-time only — TS blocks external access, but bracket notation still works at RUNTIME
  protected accountId: string;           // compile-time only — accessible in this class AND subclasses
  #realSecret: string;                     // RUNTIME-enforced privacy — genuinely inaccessible outside the class, even via tricks
}
```

### `private` vs `#field`: A Real, Not Just Stylistic, Difference
`private` is a TypeScript-only annotation, **erased entirely** on compilation — the emitted JS has no privacy at all, meaning `account['pin']` (bracket notation) bypasses `private` at runtime with zero error, since nothing in the compiled output enforces it. `#field` (native JS private fields) is enforced by the **JavaScript engine itself** — `account['#realSecret']` doesn't even work as a bracket-notation bypass, because the field's name isn't `'#realSecret'` as a string at all; it's a distinct, engine-level private slot.

### Abstract Classes: Enforcing a Subclass Contract
`abstract class` cannot be instantiated directly — it exists purely to be extended, with `abstract` methods that **must** be implemented by any concrete subclass, enforced at compile time (attempting to instantiate an abstract class, or extend it without implementing all abstract members, is a compile error).

### `implements`: Structural Contract Enforcement Against an Interface
Unlike `extends` (inheriting actual implementation), `implements` only enforces that a class's **shape** satisfies an interface — it contributes no runtime behavior at all, purely a compile-time check that the class provides everything the interface requires.

### Parameter Properties: Constructor Shorthand
`constructor(private readonly logger: Logger)` is shorthand that simultaneously declares a class field AND assigns it from the constructor argument — eliminating the otherwise-required duplicate `private logger: Logger;` field declaration plus `this.logger = logger;` assignment.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Plugin System Where Every Plugin Must Implement a Common Interface, But Genuinely Sensitive Internal State Must Be Runtime-Protected.
A plugin architecture requires every plugin class to `implement PluginContract` (ensuring every plugin has the required `init()`/`destroy()` methods, checked at compile time across the whole plugin ecosystem). Separately, a `CredentialsManager` class handling API keys needs those keys to be **genuinely** inaccessible from outside the class — not just "discouraged by convention," since a compromised third-party plugin with object access could otherwise read `private`-only-protected fields via bracket notation at runtime. Using `#apiKey` instead of `private apiKey` closes that exact bypass, since native private fields have no bracket-notation escape hatch at all.

---

## 3. Production-Grade Code Example

```typescript
// Abstract base class enforcing a subclass contract
abstract class Shape {
  abstract area(): number; // MUST be implemented by every concrete subclass — enforced at compile time

  describe(): string {
    return `This shape has an area of ${this.area()}`; // can call the abstract method — resolved polymorphically
  }
}

class Circle extends Shape {
  constructor(private readonly radius: number) { super(); } // parameter property shorthand
  area(): number { return Math.PI * this.radius ** 2; }
}

// new Shape() ❌ Error: Cannot create an instance of an abstract class
const circle = new Circle(5); // ✅ concrete subclass, all abstract members implemented
```

```typescript
// implements: structural contract enforcement, zero shared implementation
interface PluginContract {
  init(): void;
  destroy(): void;
}

class LoggingPlugin implements PluginContract {
  init() { console.log('Logging plugin initialized'); }
  destroy() { console.log('Logging plugin destroyed'); }
}
// Missing either method here would be a COMPILE error, caught before the plugin ever runs
```

```typescript
// #field: genuine runtime privacy, unlike `private`
class CredentialsManager {
  #apiKey: string; // TRUE runtime privacy — no bracket-notation bypass exists

  constructor(apiKey: string) { this.#apiKey = apiKey; }

  getAuthHeader(): string { return `Bearer ${this.#apiKey}`; }
}

const creds = new CredentialsManager('secret-key-123');
console.log((creds as any)['#apiKey']); // undefined — there IS no property literally named '#apiKey'
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Assuming `private` Provides Runtime Security
```typescript
// ❌ DANGEROUS: `private` is COMPLETELY erased at compile time — this bypass works at runtime,
// which matters a great deal if "private" was relied on for anything security-sensitive
class Account { private pin: string = '1234'; }
const acc = new Account();
console.log((acc as any)['pin']); // '1234' — private provided ZERO actual runtime protection

// ✅ CORRECT: use #field for anything where runtime privacy genuinely matters, not just code organization
class Account2 { #pin: string = '1234'; }
```

### ⚠️ Pitfall 2: Forgetting `implements` Doesn't Check Private Members
```typescript
// A class can `implements` an interface while having COMPLETELY unrelated private internals —
// implements ONLY checks the interface's own declared (typically public) members are satisfied.
// This is expected structural typing behavior, but surprises engineers expecting `implements`
// to somehow validate a class's full internal correctness against some broader contract
interface Comparable { compareTo(other: this): number; }
class Money implements Comparable {
  private cents: number = 0; // implements doesn't care about this at all — only checks compareTo() exists
  compareTo(other: Money): number { return this.cents - other.cents; }
}
```

### ⚠️ Pitfall 3: Overusing `abstract` Classes Where a Plain Interface + Composition Would Be Simpler
```typescript
// ❌ OVER-ENGINEERED: forcing inheritance for what's really just a shared, stateless behavior
// creates a rigid class hierarchy — subclasses are locked into exactly one abstract parent
abstract class Validator { abstract validate(input: string): boolean; }

// ✅ OFTEN SIMPLER: a plain function type / interface avoids the inheritance hierarchy entirely,
// and composes more freely (an object can use MULTIPLE independent validator functions,
// but can only extend ONE abstract class)
type ValidatorFn = (input: string) => boolean;
```
