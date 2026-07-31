# 🔷 React + TypeScript Integration: Props, Hooks, Generics & Event Typing

## 1. Under-The-Hood Mechanics

Typing React components correctly is mostly about applying the general TypeScript primitives covered elsewhere in this bible to React's specific shapes — props are just objects (interfaces), hooks are just generic functions, and events are a specific, React-provided set of wrapper types around native DOM events.

```typescript
interface ButtonProps {
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;     // the correct type for "anything renderable as children"
}

function Button({ label, onClick, children }: ButtonProps) { /* ... */ }
```

### Typing Hooks: Generics Applied to `useState`/`useRef`
```typescript
const [count, setCount] = useState<number>(0);              // explicit generic — usually inferred automatically from the initial value
const [user, setUser] = useState<User | null>(null);           // EXPLICIT generic needed — inference alone would give `null`, too narrow

const inputRef = useRef<HTMLInputElement>(null);                  // null-initialized DOM ref — the idiomatic pattern
```
`useState<User | null>(null)` needs an explicit generic specifically because TypeScript would otherwise infer the state's type purely from the initial value (`null`), producing a type too narrow to ever hold an actual `User` later — a very common early React+TS mistake.

### Generic Components: Reusable, Type-Safe List/Table Components
```typescript
function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode }) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}
```
The trailing comma in `<T,>` (in `.tsx` files specifically) disambiguates the generic type parameter syntax from JSX's own angle-bracket syntax — without it, a parser processing a `.tsx` file could misread `<T>` as the start of a JSX element.

### `ComponentProps<typeof X>`: Extracting Props From an Existing Component
When wrapping or extending an existing component (including third-party ones without separately-exported prop types), `React.ComponentProps<typeof Button>` extracts exactly the prop shape that component already accepts — staying automatically in sync if the wrapped component's own props change, without needing to hand-duplicate its prop interface.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Generic, Reusable `<DataTable>` Component Used Across a Dozen Different Data Shapes.
A dashboard needs data tables for users, orders, and products — each with entirely different column shapes. Rather than three separate, near-duplicate table components (or one table component typed with `any`, losing type safety for every column definition), a single generic `<DataTable<T>>` component lets each usage specify its own `T`, with column definitions and row-rendering callbacks fully typed against that specific shape — one implementation, full type safety across every distinct data shape it's used with.

---

## 3. Production-Grade Code Example

```tsx
// A generic, reusable data table component
interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
}

function DataTable<T>({ data, columns, keyExtractor }: DataTableProps<T>) {
  return (
    <table>
      <thead>
        <tr>{columns.map((col) => <th key={col.header}>{col.header}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={keyExtractor(row)}>
            {columns.map((col) => <td key={col.header}>{col.render(row)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface Order { id: string; total: number; status: string; }

function OrdersPage({ orders }: { orders: Order[] }) {
  return (
    <DataTable<Order>
      data={orders}
      keyExtractor={(o) => o.id}
      columns={[
        { header: 'ID', render: (o) => o.id },
        { header: 'Total', render: (o) => `$${o.total.toFixed(2)}` }, // fully typed — o is Order, not any
        { header: 'Status', render: (o) => o.status },
      ]}
    />
  );
}
```

```tsx
// Event typing and ComponentProps<typeof X>
function SearchInput({ onSearch }: { onSearch: (value: string) => void }) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onSearch(event.target.value); // event.target is correctly typed as HTMLInputElement, .value autocompletes
  }
  return <input onChange={handleChange} />;
}

// Extending an existing component's props without hand-duplicating them
type ExtendedButtonProps = React.ComponentProps<typeof Button> & { icon?: React.ReactNode };

function IconButton({ icon, ...buttonProps }: ExtendedButtonProps) {
  return <Button {...buttonProps}>{icon}{buttonProps.children}</Button>; // stays in sync with Button's real props automatically
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Letting `useState` Infer Too Narrow a Type From the Initial Value
```typescript
// ❌ WRONG: inferred type is `null` ONLY — setUser can NEVER actually be called with a real User later
const [user, setUser] = useState(null);
setUser({ id: '1', name: 'Alex' }); // ❌ Error: Argument of type 'User' is not assignable to parameter of type 'null'

// ✅ CORRECT: explicit generic covers the full range of values this state will actually hold
const [user, setUser] = useState<User | null>(null);
```

### ⚠️ Pitfall 2: Forgetting the Trailing Comma for Generic Components in `.tsx` Files
```tsx
// ❌ SYNTAX ERROR in .tsx: the parser reads <T> as the start of a JSX element, not a generic parameter
function List<T>(props: ListProps<T>) { /* ... */ } // fails to parse correctly in some contexts

// ✅ CORRECT: the trailing comma disambiguates it as a generic parameter list, not JSX
function List<T,>(props: ListProps<T>) { /* ... */ }
```

### ⚠️ Pitfall 3: Typing `children` as `React.ReactElement` Instead of `React.ReactNode`
```tsx
// ❌ TOO NARROW: ReactElement excludes valid children like strings, numbers, arrays, fragments, and null —
// this rejects perfectly normal usage like <Wrapper>Hello</Wrapper> or <Wrapper>{null}</Wrapper>
interface WrapperProps { children: React.ReactElement; }

// ✅ CORRECT: ReactNode is the correct, permissive type for "anything React can render as children"
interface WrapperProps2 { children: React.ReactNode; }
```
