import Container from './container';
import Inject from './annotation/Inject';
import InjectionPolicy from './injectionPolicy/InjectionPolicy';
import Singleton from './annotation/Singleton';
import prototypeScope from './scope/prototypeScope';

const IFoo = class {};
interface IFoo {
    bar: IBar;
}

const IBar = class {};
interface IBar {
    baz: IBaz;
    qux: IQux;
}

const IBaz = class {};
interface IBaz {
    qux: IQux;
}

const IQux = class {};
interface IQux {}

@Inject
class Foo {
    public qux: IQux;

    constructor(public bar: IBar) {
    }

    @Inject
    setQux(qux: IQux) {
        this.qux = qux;
    }
}

@Inject
class Bar {
    constructor(public baz: IBaz, public qux: IQux) {
    }
}

@Inject
class Baz {
    constructor(public qux: IQux) {
    }
}

@Inject
@Singleton
class Qux {
    constructor() {
    }
}

const container = new Container(new InjectionPolicy(prototypeScope));
container.bind(IFoo).to(Foo);
container.bind(IBar).to(Bar);
container.bind(IBaz).to(Baz);
container.bind(IQux).to(Qux);

const foo = container.get(Foo);
container.inject(foo.setQux, foo);

console.log(foo);
console.log(foo.bar.qux === foo.bar.baz.qux);
