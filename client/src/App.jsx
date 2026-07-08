import {  BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home' 
import About from './pages/about'
import Signin from './pages/Signin'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import MyListings from './pages/MyListings'
import CreateListing from './pages/CreateListing'
import ListingDetails from './pages/ListingDetails'
import AdminDashboard from './pages/AdminDashboard'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
export default function App() {
  
  return (
    <BrowserRouter>
   <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/listing/:listingId" element={<ListingDetails />} />
        <Route  element={<PrivateRoute />} >
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/edit-listing/:listingId" element={<CreateListing />} />
        <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
