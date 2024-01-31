import AuthComponent from './AuthComponent';
import { User } from 'firebase/auth';

function Header({ user }:{ user: User|null|undefined }) {
  return (
    <header className="h-[80px] bg-pink-600">
      <div className="max-w-[800px] w-10/12 mx-auto flex  justify-between">
        <h1 className="text-3xl text-white font-bold leading-[80px]">ito online 2</h1>
        <AuthComponent user={user}/>
      </div>
    </header>
  )
}

export default Header