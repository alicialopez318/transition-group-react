import { mount } from 'enzyme'

let React
let ReactDOM
let TransitionGroup
let Transition

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('TransitionGroup', () => {
  let container, log, Child, render;

  beforeEach(() => {
    React = require('react')
    ReactDOM = require('react-dom')
    Transition = require('../src/Transition').default
    TransitionGroup = require('../src/TransitionGroup')

    render = (element, container, callback) => ReactDOM.render(
      <React.StrictMode>{element}</React.StrictMode>,
      container,
      callback
    )

    container = document.createElement('div')

    log = []
    let events = {
      onEnter: (m) => log.push(m ? 'appear' : 'enter'),
      onEntering: (m) => log.push(m ? 'appearing' : 'entering'),
      onEntered: (m) => log.push(m ? 'appeared' : 'entered'),
      onExit: () => log.push('exit'),
      onExiting: () => log.push('exiting'),
      onExited: () => log.push('exited'),
    }

    const nodeRef = React.createRef()
    Child = function Child(props) {
      return (
        <Transition nodeRef={nodeRef} timeout={0} {...props} {...events}>
          <span ref={nodeRef} />
        </Transition>
      )
    }
  })

  it('should allow null components', () => {
    function FirstChild(props) {
      const childrenArray = React.Children.toArray(props.children)
      return childrenArray[0] || null
    }

    mount(
      <TransitionGroup component={FirstChild}>
        <Child />
      </TransitionGroup>
    )
  })

  it('should allow callback refs', () => {
    const ref = jest.fn()

    class Child extends React.Component {
      render() {
        return <span />
      }
    }

    mount(
      <TransitionGroup>
        <Child ref={ref} />
      </TransitionGroup>
    )

    expect(ref).toHaveBeenCalled()
  })

  it('should work with no children', () => {
    render(<TransitionGroup />, container)
  })

  it('should handle transitioning correctly', () => {
    function Parent({ count = 1 }) {
      let children = []
      for (let i = 0; i < count; i++) children.push(<Child key={i} />)
      return (
        <TransitionGroup appear enter exit>
          {children}
        </TransitionGroup>
      )
    }

    jest.useFakeTimers()
    render(<Parent />, container)

    jest.runAllTimers()
    expect(log).toEqual(['appear', 'appearing', 'appeared'])

    log = []
    render(<Parent count={2} />, container)
    jest.runAllTimers()
    expect(log).toEqual(['enter', 'entering', 'entered'])

    log = []
    render(<Parent count={1} />, container)
    jest.runAllTimers()
    expect(log).toEqual(['exit', 'exiting', 'exited'])
  })
})
