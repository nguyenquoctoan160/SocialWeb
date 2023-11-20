import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Story from "./pages/story/Story";
import Chat from "./pages/chat/Chat";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  Link,
  useParams,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Search from "./pages/search/Search";

import "./style.scss";
import "./pages/story/story.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

import { useCookies } from "react-cookie";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchPost from "./pages/searchPost/SearchPost";
import PostPage from "./pages/postPage/PostPage";

function App() {
  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
          <div style={{ display: "flex" }}>
            <LeftBar />
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
            <RightBar />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const StoryLayout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <div style={{ display: "flex" }}>
            <LeftBar />
            <div
              className="story-page"
              style={{
                flex: 6,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Story />
              <Link to="/">
                <button className="close-button">
                  <FontAwesomeIcon icon={faX} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    const [cookies] = useCookies(["accessToken"]);
    if (!currentUser || !cookies.accessToken) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/profile/:userId",
          element: <Profile />,
        },
        {
          path: "/search/:searchText",
          element: <Search />,
        },
        {
          path: "/post/:searchText",
          element: <SearchPost isHashtag={false} />,
        },
        {
          path: "/hashtag/:searchText",
          element: <SearchPost isHashtag={true} />,
        },
        {
          path: "/seepost/:postId",
          element: <PostPage />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/stories/:userId",
      element: <StoryLayout />,
    },
    // {
    //   path: "/chat/:friendid",
    //   element: <Chat />,
    // },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
