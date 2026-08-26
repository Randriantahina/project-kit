# Best practices core reference

Language- and framework-agnostic. Written once, shipped with the plugin,
never regenerated per project. `actions/init.md` (and `refresh.md`)
translate the relevant parts of this into `.project-kit/BEST-PRACTICES.md`
for each detected stack — that per-project file is where the idiomatic,
concrete guidance lives. This file is the theory those translations draw
from.

For every entry below: apply it because the concrete problem it solves is
actually present, not because a checklist says so. Over-applying a pattern
where a plain function would do is its own kind of bad design.

## SOLID

- **Single Responsibility** — a class/module should have one reason to
  change. Symptom of a violation: a class named with "And"/"Manager"/"Utils"
  that touches unrelated concerns.
- **Open/Closed** — extend behavior via new code (new implementation of an
  interface, new strategy), not by editing a growing `switch`/`if` chain in
  existing code every time a new case appears.
- **Liskov Substitution** — a subtype must be usable anywhere its base type
  is expected without surprising the caller. Symptom of a violation: a
  subclass that throws "not supported" on a method the base type promises.
- **Interface Segregation** — many small, focused interfaces beat one large
  interface that forces implementers to stub out methods they don't need.
- **Dependency Inversion** — depend on an abstraction (interface/trait/port),
  not a concrete implementation, at the boundary between layers — this is
  what makes swapping a database, an HTTP client, or a queue driver a
  one-file change instead of a rewrite.

## Design patterns — when to reach for them

**Creational**
- *Factory* — construction logic is non-trivial or depends on runtime
  input; hides the concrete type behind a common interface.
- *Builder* — an object has many optional construction parameters;
  avoids constructor telescoping.
- *Singleton* — genuinely one instance must exist app-wide (e.g. a
  connection pool) — avoid it as a lazy substitute for dependency
  injection; it hides dependencies and complicates testing.

**Structural**
- *Adapter* — make an existing interface match one your code expects,
  without modifying the existing class (e.g. wrapping a third-party SDK).
- *Decorator* — add behavior (logging, caching, retry) around an object
  without subclassing every combination.
- *Facade* — give a simple entry point over a complex subsystem so callers
  don't need to know its internals.

**Behavioral**
- *Strategy* — an algorithm/behavior varies and should be swappable at
  runtime or per configuration (e.g. pricing rules, sorting criteria).
- *Observer* — multiple parts of the system must react to an event without
  the event source knowing about them (often a framework's event/listener
  system already gives you this — don't hand-roll it if so).
- *Template Method* — a multi-step process is fixed in order but individual
  steps vary by case; put the skeleton in a base, override the steps.

Don't reach for a named pattern when a plain function/composition already
solves the problem — the pattern exists to name a recurring shape, not to
be forced onto every class.

## Application architecture patterns

- **DTO (Data Transfer Object)** — a plain data-carrying struct/class used
  to move data across a boundary (HTTP request/response, service call)
  without exposing internal domain/ORM models. Prevents leaking database
  columns into an API response and lets the two evolve independently.
  Keep DTOs free of behavior beyond simple validation/mapping.
- **Value Object** — an immutable object defined entirely by its value
  (e.g. `Money`, `EmailAddress`) rather than an identity — use it to make
  invalid states unrepresentable instead of validating a raw primitive
  everywhere it's used.
- **Repository** — hides how data is fetched/persisted behind a
  collection-like interface, so business logic doesn't depend on a
  specific ORM/query builder and can be tested against a fake.
- **Service Layer** — orchestrates a use case (calls one or more
  repositories, applies business rules) so controllers/handlers stay thin
  and business logic isn't duplicated across entry points.
- **Mapper/Adapter between layers** — explicit conversion functions between
  DTOs, domain objects, and persistence models, instead of passing one
  model type through every layer.
- **Layered / Clean / Hexagonal separation** — controller (or handler) →
  service (use case) → domain → repository (data access), with
  dependencies pointing inward (outer layers depend on inner abstractions,
  never the reverse). The specific names vary by framework/community; the
  invariant is: business rules don't import framework/infrastructure code.

## Error handling and validation

- Validate at the boundary (incoming request, external API response) and
  let internal code trust its inputs afterward — don't re-validate the same
  thing at every layer.
- Make errors explicit in the type system where the language supports it
  (`Result`, checked/typed exceptions, discriminated unions) rather than
  relying on undocumented exceptions or sentinel values (`null`, `-1`) that
  callers can silently ignore.
- Fail with a message that names what was expected vs. what was received —
  not just "invalid input".

## Clean code

- Name things for what they represent, not their type or implementation
  (`overdueInvoices`, not `list1`).
- A function does one thing at one level of abstraction; if describing it
  needs "and", split it.
- Prefer few parameters; group related ones into a DTO/Value Object instead
  of adding another positional argument.
- Cyclomatic complexity and nesting depth are a signal to extract, not a
  metric to game.
- Comments explain *why* (a non-obvious constraint, a workaround), never
  *what* — well-named code should make the "what" redundant.

## Testing

- Test pyramid: many fast unit tests on pure logic, fewer integration tests
  crossing a real boundary (DB, HTTP), fewer still end-to-end tests.
- Mock/fake at architectural boundaries you own (a repository interface),
  not the internals of your own code — mocking too deep makes tests
  brittle without catching real regressions.
- A test name should describe the behavior under test and the expected
  outcome, not just the method being called.
