import React, { useContext, createContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";
import { apiLogin, apiPostData, apiGetData, apiUpdateData } from "./service";

// This example has 3 pages: a public page, a protected
// page, and a login screen. In order to see the protected
// page, you must first login. Pretty standard stuff.
//
// First, visit the public page. Then, visit the protected
// page. You're not yet logged in, so you are redirected
// to the login page. After you login, you are redirected
// back to the protected page.
//
// Notice the URL change each time. If you click the back
// button at this point, would you expect to go back to the
// login page? No! You're already logged in. Try it out,
// and you'll see you go back to the page you visited
// just *before* logging in, the public page.

export default function AuthExample() {
  return (
    <ProvideAuth>
      <Router>
        <div>
          <AuthButton />

          <ul>
            <li>
              <Link to="/public">Public Page</Link>
            </li>
            <li>
              <Link to="/protected">Protected Page</Link>
            </li>
          </ul>

          <Switch>
            <Route path="/public">
              <PublicPage />
            </Route>
            <Route path="/login">
              <LoginPage />
            </Route>
            <PrivateRoute path="/protected">
              <ProtectedPage />
            </PrivateRoute>
          </Switch>
        </div>
      </Router>
    </ProvideAuth>
  );
}


/** For more details on
 * `authContext`, `ProvideAuth`, `useAuth` and `useProvideAuth`
 * refer to: https://usehooks.com/useAuth/
 */
const authContext = createContext();

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [name, setName] = useState(null);
  const [username, setUsername] = useState(null);
  const [access, setAccess] = useState(null);

  const signin = (cb, un, n, token) => {
    setUsername(un)
    setName(n)
    setAccess(token);
    cb();
  };

  const signout = cb => {
    setUsername(null);
    setName(null);
    setAccess(null);
    cb();
  };

  return {
    name,
    username,
    access,
    signin,
    signout
  };
}

function AuthButton() {
  let history = useHistory();
  let auth = useAuth();

  return auth.username ? (
    <p>
      Welcome!{" "} {auth.username} {auth.name && ` - ${auth.name}`}
      <button
        onClick={() => {
          auth.signout(() => history.push("/"));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  );
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  let auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.username ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}

function ProtectedPage() {
  let auth = useAuth();
  const [lists, setLists] = useState([]);
  const [task, setTask] = useState("");

  useEffect(() => {
    const fetchData = () => {
      return apiGetData(auth.access)
        .then(result => result && setLists(result.data.results))
    }
    fetchData();
  }, [auth.access])

  const updateDone = (o) => {
    o['done'] = !o.done
    apiUpdateData(o, auth.access)
      .then(result => result && setLists([...lists], result.data))
  }

  const postData = () => {
    apiPostData(task, auth.access)
      .then(result => result && (setLists([...lists, result.data]) || setTask('')))
  }

  return (
    <>
      <h3>Todo:</h3>
      {lists ? lists.map((o, i) => (
        <div key={i}><span onClick={() => updateDone(o)}>[{`${o.done ? 'X' : ' '}`}]</span> {o.task}</div>
      )) : 'None'}
      <br />
      Add: <input type="text" value={task} onChange={e => setTask(e.target.value)} /> <button onClick={postData}>add</button>
    </>
  );
}

function LoginPage() {
  let history = useHistory();
  let location = useLocation();
  let auth = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  let { from } = location.state || { from: { pathname: "/" } };
  let login = () => {
    apiLogin(username, password)
      .then(result => {
        if (result) {
          const { username, name, access } = result.data
          auth.signin(() => {
            history.replace(from);
          }, username, name, access);
        }
      })
  };

  return (
    <div>
      <p>You must log in to view the page at {from.pathname}</p>
      Username: <input type="text" value={username} onChange={e => setUsername(e.target.value)} /><br />
      Passowrd: <input type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={login}>Log in</button>
    </div>
  );
}
