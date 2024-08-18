import { useNavigate } from "react-router-dom";
import styles from "./CommonHeader.module.scss";

const CommonHeader = () => {
  const navigate = useNavigate();

  const moveToPage = (filter: string) => {
    if (filter === "main") {
      navigate("/");
    } 

    if (filter === "bookmark") {
      navigate("/bookmark");
    }
  };

 

  return (
    <header className={styles.header}>
        <div className={styles.header__logoBox} onClick={() => moveToPage("main")}>
            <img src="src/assets/images/image-logo.png" className={styles.header__logoBox__logo} alt="" />
            <span className={styles.header__logoBox_title}>
                PhotoSplash
            </span>
        </div>
        
        <div className={styles.header__profileBox}>
            <button className={styles.header__profileBox__button}>사진 제출</button>
            <button className={styles.header__profileBox__button} onClick={() => moveToPage("bookmark")}>북마크</button>
            <span className={styles.header__profileBox__userName}>YHS</span>
        </div>
      
    </header>
  )
}

export default CommonHeader
