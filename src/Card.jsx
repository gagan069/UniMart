
import profilePic from './WIN_20260708_02_05_57_Pro.jpg'

function Card(){
    return(
        <div className="card">
            <img className="card-image" src={profilePic} alt="profile pic" />
            <h2 className='card-title'>Satkar Singh</h2>
            <p>I am a student, studying CSE - core</p>
        </div>
    );
}

export default Card