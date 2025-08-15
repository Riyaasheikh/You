import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Quran.css';

function Quran() {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [translationEdition, setTranslationEdition] = useState('en.asad');
  const [audioEdition, setAudioEdition] = useState('ar.alafasy');
  const [currentVerse, setCurrentVerse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [activeVerse, setActiveVerse] = useState(null);
  const [isPlayingFullSurah, setIsPlayingFullSurah] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [translations, setTranslations] = useState({});
  const verseRefs = useRef({});
  const versesContainerRef = useRef(null);
  const audioRef = useRef(null);

  // Fetch list of surahs
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        setSurahs(data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load Quran data. Please try again later.');
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        setAudioProgress(0);
        audioRef.current.play().catch(err => {
          console.error("Audio playback failed:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle when audio metadata is loaded
  const handleLoadedMetadata = () => {
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    if (isPlayingFullSurah && selectedSurah) {
      if (currentVerseIndex < selectedSurah.ayahs.length - 1) {
        const nextIndex = currentVerseIndex + 1;
        setCurrentVerseIndex(nextIndex);
        const nextVerse = selectedSurah.ayahs[nextIndex];
        setCurrentVerse(nextVerse);
        setActiveVerse(nextVerse.numberInSurah);
      } else {
        setIsPlaying(false);
        setIsPlayingFullSurah(false);
        setCurrentVerse(null);
      }
    } else {
      setIsPlaying(false);
      setCurrentVerse(null);
    }
  };

  // Auto-scroll to active verse - FIXED TO WORK WITH BISMILLAH AS FIRST VERSE
  useEffect(() => {
    if (activeVerse !== null && verseRefs.current[activeVerse] && versesContainerRef.current) {
      const verseElement = verseRefs.current[activeVerse];
      const container = versesContainerRef.current;
      
      // Calculate positions
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const verseTop = verseElement.offsetTop;
      const verseBottom = verseTop + verseElement.clientHeight;
      
      // Check if verse is not in view
      if (verseTop < containerTop || verseBottom > containerBottom) {
        // Scroll to center the verse
        const targetPosition = verseTop;
        container.scrollTo({
          top: targetPosition-container.clientHeight/1.12,
          behavior: 'smooth'
        });
      }
    }
  }, [activeVerse]);

  // Handle time update for progress bar
  const handleTimeUpdate = (e) => {
    const audio = e.target;
    if (audio.duration) {
      const progress = (audio.currentTime / audio.duration) * 100;
      setAudioProgress(progress);
    }
  };

  // Play/pause toggle
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Stop audio playback completely
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsPlayingFullSurah(false);
    setCurrentVerse(null);
    setActiveVerse(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Play entire surah - FIXED TO START AT VERSE 1 (BISMILLAH)
  const playFullSurah = () => {
    if (selectedSurah && selectedSurah.ayahs.length > 0) {
      setCurrentVerseIndex(0);
      const firstVerse = selectedSurah.ayahs[0];
      setCurrentVerse(firstVerse);
      setActiveVerse(firstVerse.numberInSurah);
      setIsPlaying(true);
      setIsPlayingFullSurah(true);
    }
  };

  // Play specific verse
  const playVerse = (verse) => {
    setCurrentVerse(verse);
    setActiveVerse(verse.numberInSurah);
    setIsPlaying(true);
    setIsPlayingFullSurah(false);
    setCurrentVerseIndex(selectedSurah.ayahs.findIndex(v => v.numberInSurah === verse.numberInSurah));
  };

  // Fetch translations for a surah
  const fetchTranslations = useCallback(async (surahNumber) => {
    try {
      const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${translationEdition}`);
      const translationData = await translationResponse.json();
      
      const translationsMap = {};
      translationData.data.ayahs.forEach(verse => {
        translationsMap[verse.numberInSurah] = verse.text;
      });
      setTranslations(translationsMap);
    } catch (err) {
      console.error("Error fetching translations:", err);
      setError('Failed to load translations. Please try again.');
    }
  }, [translationEdition]);

  // Fetch details of a surah - FIXED TO HANDLE BISMILLAH AS FIRST VERSE
  const fetchSurahDetails = useCallback(async (surahNumber) => {
    try {
      setLoading(true);
      setSelectedSurah(null);
      setActiveVerse(null);
      setCurrentVerse(null);
      setIsPlaying(false);
      setIsPlayingFullSurah(false);
      setTranslations({});
      
      // Fetch the surah text in Arabic
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      const surahData = await surahResponse.json();
      
      // Fetch the audio for the surah
      const audioResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${audioEdition}`);
      const audioData = await audioResponse.json();
      
      // Fetch translations
      await fetchTranslations(surahNumber);
      
      // Combine all data
      const versesWithAudio = surahData.data.ayahs.map((verse, index) => ({
        ...verse,
        audio: audioData.data.ayahs[index].audio
      }));
      
      setSelectedSurah({
        ...surahData.data,
        ayahs: versesWithAudio
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching surah details:", err);
      setError('Failed to load surah details. Please try again.');
      setLoading(false);
    }
  }, [audioEdition, fetchTranslations]);

  // Handle translation change in detail view
  useEffect(() => {
    if (selectedSurah) {
      fetchTranslations(selectedSurah.number);
    }
  }, [translationEdition, selectedSurah, fetchTranslations]);

  // Filter surahs based on search
  const filteredSurahs = surahs.filter(surah => {
    const searchLower = searchTerm.toLowerCase();
    return (
      surah.englishName.toLowerCase().includes(searchLower) ||
      surah.englishNameTranslation.toLowerCase().includes(searchLower) ||
      surah.name.toLowerCase().includes(searchLower) ||
      surah.number.toString().includes(searchTerm)
    );
  });

  // Go back to surah list
  const goBackToSurahList = () => {
    setSelectedSurah(null);
    setCurrentVerse(null);
    setIsPlaying(false);
    setTranslations({});
  };

  // Get language name from edition code
  const getLanguageName = (editionCode) => {
    const languageMap = {
      'en': 'English',
      'ur': 'Urdu',
      'fr': 'French',
      'es': 'Spanish',
      'de': 'German',
      'tr': 'Turkish',
      'ar': 'Arabic'
    };
    
    const parts = editionCode.split('.');
    return languageMap[parts[0]] || parts[0].toUpperCase();
  };

  // Get reciter name
  const getReciterName = (edition) => {
    const reciterMap = {
      'ar.alafasy': 'Mishary Alafasy',
      'ar.abdulsamad': 'Abdul Rahman Al-Sudais',
      'ar.husary': 'Mahmoud Khalil Al-Husary',
      'ar.mahermuaiqly': 'Maher Al Muaiqly'
    };
    return reciterMap[edition] || edition;
  };

  return (
    <div className="quran-app">
      <header className="app-header py-3 text-center text-white">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">
            <i className="fas fa-book-quran me-2"></i>
            {selectedSurah ? selectedSurah.englishName : 'Quran Explorer'}
          </h1>
          <p className="lead mb-0">
            {selectedSurah ? selectedSurah.englishNameTranslation : 'Discover and reflect upon the Holy Quran'}
          </p>
        </div>
      </header>

      <main className="py-4 flex-grow-1 d-flex align-items-center">
        <div className="container">
          {/* Loading Skeleton */}
          {loading && (
            <div className="skeleton-loader text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading Quran data...</p>
            </div>
          )}
          
          {/* Error Message */}
          {error && !loading && (
            <div className="alert alert-danger text-center mx-auto" style={{ maxWidth: '800px' }}>
              {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Surah List View */}
          {!selectedSurah && !loading && !error && (
            <div className="surah-list-view mx-auto" style={{ maxWidth: '800px' }}>
              <div className="search-box mb-4">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search surahs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="settings mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Translation:</label>
                    <select 
                      className="form-select"
                      value={translationEdition} 
                      onChange={(e) => setTranslationEdition(e.target.value)}
                    >
                      <option value="en.asad">English (Asad)</option>
                      <option value="en.pickthall">English (Pickthall)</option>
                      <option value="fr.hamidullah">French (Hamidullah)</option>
                      <option value="ur.maududi">Urdu (Maududi)</option>
                      <option value="es.bornez">Spanish (Bornez)</option>
                      <option value="de.aburida">German (Abu Rida)</option>
                      <option value="tr.yazir">Turkish (Yazir)</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Recitation:</label>
                    <select 
                      className="form-select"
                      value={audioEdition} 
                      onChange={(e) => setAudioEdition(e.target.value)}
                    >
                      <option value="ar.alafasy">Mishary Alafasy</option>
                      <option value="ar.abdulsamad">Abdul Rahman Al-Sudais</option>
                      <option value="ar.husary">Mahmoud Khalil Al-Husary</option>
                      <option value="ar.mahermuaiqly">Maher Al Muaiqly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="surah-list-container">
                <div className="surah-list">
                  {filteredSurahs.map(surah => (
                    <div
                      key={surah.number}
                      className="surah-item"
                      onClick={() => fetchSurahDetails(surah.number)}
                    >
                      <div className="surah-number">{surah.number}.</div>
                      <div className="surah-info">
                        <div className="surah-name">
                          {surah.englishName}
                          <span className="translation"> - {surah.englishNameTranslation}</span>
                        </div>
                        <div className="surah-meta">
                          <span className="verses">{surah.numberOfAyahs} Verses</span>
                          <span className="arabic-name">{surah.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Surah Detail View */}
          {selectedSurah && !loading && !error && (
            <div className="surah-detail-view mx-auto" style={{ maxWidth: '900px' }}>
              <div className="surah-header p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={goBackToSurahList}
                  >
                    <i className="fas fa-arrow-left me-1"></i> Back to Surahs
                  </button>
                  
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <label className="text-white me-2">Translation:</label>
                      <select 
                        className="form-select form-select-sm"
                        value={translationEdition} 
                        onChange={(e) => setTranslationEdition(e.target.value)}
                      >
                        <option value="en.asad">English (Asad)</option>
                        <option value="ur.maududi">Urdu (Maududi)</option>
                        <option value="fr.hamidullah">French (Hamidullah)</option>
                        <option value="es.bornez">Spanish (Bornez)</option>
                        <option value="de.aburida">German (Abu Rida)</option>
                      </select>
                    </div>
                    
                    <div className="btn-group">
                      <button 
                        className={`btn ${isPlayingFullSurah ? 'btn-danger' : 'btn-success'} btn-sm`}
                        onClick={playFullSurah}
                        disabled={isPlaying && !isPlayingFullSurah}
                      >
                        <i className={`fas fa-${isPlayingFullSurah ? 'pause' : 'play'} me-1`}></i>
                        Play Surah
                      </button>
                      <button 
                        className="btn btn-dark btn-sm"
                        onClick={stopPlayback}
                      >
                        <i className="fas fa-stop me-1"></i>
                        Stop
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-light text-dark me-2">
                      {selectedSurah.revelationType}
                    </span>
                    <span className="text-light">
                      {selectedSurah.numberOfAyahs} Verses
                    </span>
                  </div>
                  <h1 className="arabic-title mb-0">{selectedSurah.name}</h1>
                </div>
              </div>

              {/* Audio Player */}
              {currentVerse && (
                <div className="audio-player p-3">
                  <div className="d-flex align-items-center">
                    <button
                      className={`btn btn-${isPlaying ? 'danger' : 'success'} btn-sm me-3`}
                      onClick={togglePlayback}
                    >
                      <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                    </button>
                    <div className="flex-grow-1 me-3">
                      <div className="fw-bold">
                        Verse {currentVerse.numberInSurah}
                      </div>
                      <div className="progress mt-2" style={{height: '4px'}}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{width: `${audioProgress}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="reciter">
                      {getReciterName(audioEdition)}
                    </div>
                  </div>
                  <audio 
                    ref={audioRef}
                    src={currentVerse.audio} 
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    onLoadedMetadata={handleLoadedMetadata}
                    preload="auto"
                  />
                </div>
              )}

              {/* Verses List */}
              <div className="verses-list" ref={versesContainerRef}>
                {selectedSurah.ayahs.map((verse) => (
                  <div 
                    key={verse.number} 
                    ref={el => verseRefs.current[verse.numberInSurah] = el}
                    className={`verse-item ${activeVerse === verse.numberInSurah ? 'active' : ''}`}
                  >
                    <div className="verse-header">
                      <span className="verse-number">{verse.numberInSurah}</span>
                      <div className="verse-controls">
                        <button 
                          className={`btn btn-sm ${activeVerse === verse.numberInSurah && isPlaying ? 'btn-danger' : 'btn-outline-primary'} me-2`}
                          onClick={() => playVerse(verse)}
                        >
                          <i className={`fas fa-${activeVerse === verse.numberInSurah && isPlaying ? 'pause' : 'play'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="verse-content">
                      <p className="arabic-text">{verse.text}</p>
                      <div className="translation-box">
                        <p className="mb-0">
                          <strong>{getLanguageName(translationEdition)} Translation:</strong> 
                          <span className="translation-text">
                            {translations[verse.numberInSurah] || "Loading translation..."}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer py-3 text-center text-white">
        <div className="container">
          <p className="mb-0">
          Contains 114 Surahs and 6,236 Verses
          </p>
          <p className="mb-0 small">
            &copy; {new Date().getFullYear()} Quran Explorer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Quran;