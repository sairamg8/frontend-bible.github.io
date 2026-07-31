# ⚡ Prototypes & OOP: The Prototype Chain, `class` Syntax & Private Fields

## 1. Under-The-Hood Mechanics

JavaScript's object model is fundamentally **prototypal**, not classical — even `class` syntax (covered below) is syntactic sugar over the same underlying prototype chain mechanism, not a genuinely different inheritance model.

```
instance.someMethod()
        │
        ▼
Does `instance` OWN a property called someMethod?  ──NO──►  check instance.[[Prototype]]
        │                                                          │
       YES                                                        ▼
        │                                          Does THAT object own someMethod? ──NO──► check ITS [[Prototype]]
        ▼                                                          │                              (continues up the chain)
   call it directly                                               YES
                                                                    │
                                                                    ▼
                                                              call it (found on the chain)
```

### `Object.create()`: Manual Prototype Linking
`Object.create(proto)` creates a new object whose `[[Prototype]]` is explicitly `proto` — no constructor function or `class` needed at all, the most direct way to see that prototypal inheritance is fundamentally about **linking objects to other objects**, not about classes.

### `class` Syntax: Sugar Over the Same Mechanism
```javascript
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound.`; } // added to Animal.prototype, NOT to each instance
}
```
Every method defined in a `class` body is placed on the constructor function's `.prototype` object — identical to manually doing `Animal.prototype.speak = function() {...}` in pre-ES6 code. `class` adds real syntactic and semantic improvements (methods are non-enumerable by default, classes are not hoisted the way function declarations are, `extends`/`super` provide cleaner inheritance wiring) but the runtime object model underneath is the same prototype chain.

### Static Members vs Instance Members
`static` members live on the **class/constructor function itself**, not on instances or `.prototype` — accessed as `ClassName.staticMethod()`, never `instance.staticMethod()`.

### Private Fields (`#field`): True, Engine-Enforced Encapsulation
Unlike a `_prefixedConvention` (pure convention, fully accessible), `#field` is enforced by the JS engine itself — code outside the class body cannot read, write, or even check for the existence of a `#field` via any means (bracket notation, `Object.keys`, `Reflect`), a genuine language-level privacy guarantee (matching what TypeScript's `#field` support, covered in the [TS classes doc](../../typescript/10-classes-and-oop/01-class-based-typing.md), compiles down to).

---

## 2. Real-World Engineering Scenario

**Scenario**: Debugging Why a Method Added to One Instance Wasn't Available on Sibling Instances.
An engineer added a method directly to a single object instance (`user.greet = function() {...}`) expecting all `User`-created objects to gain it — a misunderstanding of where methods actually need to live. Because `class`/constructor methods are placed on the shared `.prototype` object (looked up via the chain for every instance), while an ad-hoc assignment like `user.greet = ...` only adds an **own property** to that one specific instance, sibling instances created from the same class never saw the new method at all. The fix was adding the method to `User.prototype.greet` (or the `class` body directly) so every instance's prototype chain lookup would find it.

---

## 3. Production-Grade Code Example

```javascript
// Object.create() — the most direct illustration of prototypal linking, no class/constructor needed
const animalProto = {
  speak() { return `${this.name} makes a sound.`; },
};

const dog = Object.create(animalProto); // dog.[[Prototype]] === animalProto, explicitly
dog.name = 'Rex';
console.log(dog.speak()); // 'Rex makes a sound.' — found via the prototype chain, not an OWN property of dog
```

```javascript
// class syntax — the same underlying mechanism, with cleaner inheritance syntax
class Animal {
  static kingdom = 'Animalia'; // STATIC — lives on the Animal class itself, not on instances

  #secretId = crypto.randomUUID(); // TRUE private field — inaccessible from outside, even via bracket notation

  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound.`; } // placed on Animal.prototype
  getId() { return this.#secretId; } // the ONLY way to read #secretId from outside the class
}

class Dog extends Animal {
  speak() { return `${this.name} barks.`; } // overrides Animal.prototype.speak via the chain
}

const rex = new Dog('Rex');
console.log(rex.speak());        // 'Rex barks.' — Dog.prototype.speak found FIRST in the chain
console.log(Animal.kingdom);      // 'Animalia' — accessed on the CLASS, never on an instance
console.log(rex.getId());          // a UUID — the only sanctioned way to read the private field
console.log(rex['#secretId']);       // undefined — there is NO property literally named '#secretId'
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Adding a Method to One Instance Instead of the Prototype
```javascript
// ❌ WRONG: this method exists ONLY on this ONE instance, not on the shared prototype
const user1 = new User('Alex');
user1.greet = function () { console.log(`Hi, I'm ${this.name}`); };
const user2 = new User('Sam');
user2.greet(); // ❌ TypeError: user2.greet is not a function — sibling instances never got it

// ✅ CORRECT: add shared behavior to the class body (compiles to .prototype) so EVERY instance,
// past and future, has access to it via the prototype chain
class User { greet() { console.log(`Hi, I'm ${this.name}`); } }
```

### ⚠️ Pitfall 2: Assuming `class` Declarations Are Hoisted Like Function Declarations
```javascript
// ❌ WRONG: unlike function declarations, class declarations are hoisted but left in the
// Temporal Dead Zone (same as let/const) — this throws, it does NOT work like a hoisted function
const rex = new Dog('Rex'); // ❌ ReferenceError: Cannot access 'Dog' before initialization
class Dog { /* ... */ }

// ✅ AWARENESS: always declare a class before using it, just as you would with let/const
```

### ⚠️ Pitfall 3: Forgetting `super()` Must Be Called Before Using `this` in a Subclass Constructor
```javascript
// ❌ WRONG: `this` doesn't exist yet in a derived class's constructor until super() has run —
// this is a hard, engine-enforced rule, not just a style preference
class Dog extends Animal {
  constructor(name, breed) {
    this.breed = breed; // ❌ ReferenceError: Must call super constructor before accessing 'this'
    super(name);
  }
}

// ✅ CORRECT: always call super() FIRST in a derived class's constructor
class Dog2 extends Animal {
  constructor(name, breed) {
    super(name); // must come first
    this.breed = breed; // ✅ now safe
  }
}
```
