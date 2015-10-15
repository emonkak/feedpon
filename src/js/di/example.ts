import Container from './container'
import { DefaultInjectionPolicy } from './injection-policies'
import { Inject, Singleton } from './annotations'

var IFoo: any = "IFoo"
interface IFoo {
    bar: IBar
}

var IBar: any = "IBar"
interface IBar {
    baz: IBaz
    qux: IQux
}

var IBaz: any = "IBaz"
interface IBaz {
    qux: IQux
}

var IQux: any = "IQux"
interface IQux {}

@Inject
class Foo {
    public qux: IQux

    constructor(public bar: IBar) {
    }

    @Inject
    setQux(qux: IQux) {
        this.qux = qux
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

const container = new Container(new DefaultInjectionPolicy())
container.bind(IFoo).to(Foo)
container.bind(IBar).to(Bar)
container.bind(IBaz).to(Baz)
container.bind(IQux).to(Qux)

const foo = container.get(Foo)
container.inject(foo.setQux, foo)

console.log(foo)
console.log(foo.bar.qux === foo.bar.baz.qux)
