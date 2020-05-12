const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')
// const Dashboard = require('./dashboard')

const mongoose=require('mongoose')

AdminBro.registerAdapter(AdminBroMongoose)

const UserSchema = require('../models/userschema')

var Member = mongoose.model("Member", UserSchema);

const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@taxation.com',
  password: process.env.ADMIN_PASSWORD || 'taxationpass',
}

const AdminBroOptions = {
  resources: [{
    resource: Member,
    options: {
      parent:{
        name: 'User Content',
        icon: 'fa fa-user'
      }
    }
  }],
  dashboard: {
    render:{
      show:(property, resource,helpers)=>{
        const html=
        abcd

        return html
      }
    }
  },
  databases:[mongoose],
  dashboard: {
    handler: async () => {
      // dashboard:{
      //   isVisible:{show:true},
      // render:{
      //   show:{()=>{
      //     const html=
      //     <div>
      //       this is dashboard page
      //     </div>
      //     return html
      //   }
          
      //   }
      // }}
    },
  },
  rootpath:'/admin',
  branding:{
    logo:'https://lh3.googleusercontent.com/08icL7eX2fjXoP3_SsDEYGNpvMdjasMcBdE033glDXSnjTHRFEIRjm25Da68QQQjRb8',
    companyName: 'Iniesta-Taxation-Admin'
  }
}


const adminBro = new AdminBro(AdminBroOptions)
// const router = AdminBroExpress.buildRouter(adminBro)

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro,{
  cookieName: process.env.ADMIN_COOKIE_NAME || 'admin-bro',
  cookiePassword: process.env.ADMIN_COOKIE_PASS || 'coz-i-can-not-decide-a-super-long-password',
  authenticate: async(email, password) =>{
    if(email === ADMIN.email && password === ADMIN.password){
      return ADMIN
    }
    return null
  }
})

module.exports = router
