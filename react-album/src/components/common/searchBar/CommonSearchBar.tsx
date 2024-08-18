import React, { useState } from 'react'
import styles from "./CommonSearchBar.module.scss"
import { useRecoilState } from 'recoil';
import { searchState } from '@/recoil/atoms/searchState';
import { pageState } from '@/recoil/atoms/pageState';

const CommonSearchBar = () => {
  const [search, setSearch] = useRecoilState(searchState);
  const [page, setPage] = useRecoilState(pageState);
  const [text, setText] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }

  const onSearch = () => {
    if (text === "") {
      setSearch("Korea");
      setPage(1);
    } else {
      setSearch(text);
      setPage(1);
    }

  };

  const handleKeyDown = (e: React.KeyboardEvent) => {

    if (e.key === "Enter") {

      if (text === "") {

        // 빈값으로 검색했을때 기본 값 설정 
        setSearch("Korea");
        setPage(1);
      } else {
        setSearch(text);
        setPage(1);
      }
    }
  };

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchBar__search}>
        <input type="text" placeholder="찾으실 이미지를 검색하세요." className={styles.searchBar__search__input} value={text} onChange={onChange} onKeyDown={handleKeyDown} />
        <img src="src/assets/icons/icon-search.svg" alt="" onClick={onSearch} />
      </div>
    </div>
  )
}

export default CommonSearchBar
