import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import UserRegister from '../pages/Auth/UserRegister'
import UserLogin from '../pages/Auth/UserLogin'
import PartnerRegister from '../pages/Auth/PartnerRegister'
import PartnerLogin from '../pages/Auth/PartnerLogin'
import Home from '../pages/general/Home'
import Profile from '../pages/foodpartner/Profile'
import Reels from '../pages/general/Reels'
import SavedReels from '../pages/general/SavedReels'
import FoodPartner from '../pages/foodpartner/CreateFoodItem'
const AppRoutes = () => {
  return (
    <div>
        <Router>
            <Routes>
              <Route path='/reels' element={<Reels/>}/>
              <Route path='/saved' element={<SavedReels/>}/>
                <Route path='/create/food' element={<FoodPartner/>}/>
                <Route path='/' element={<Home/>}/>
                <Route path='/user/register' element={<UserRegister/>}/>
                <Route path='/user/login' element={<UserLogin/>}/>
                <Route path='/food-partner/register' element={<PartnerRegister/>}/>
                <Route path='/food-partner/login' element={<PartnerLogin/>}/>
                <Route path='/food-partner/profile/:id' element={<Profile/>}/>
            </Routes>
        </Router>
      
    </div>
  )
}

export default AppRoutes
