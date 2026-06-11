const database = require('./database');
const config = require('../config');
const api_key = config.tmdbApiKey;
const axios = require('axios');
// const fetch = require('node-fetch');
const url1 = `https://api.themoviedb.org/3/movie/now_playing?api_key=${api_key}&language=en-US&page=1`;
const url3 = `https://api.themoviedb.org/3/movie/upcoming?api_key=e7bafd491af23dcc2cc134b14174e118&language=en-US&page=1`;

async function fetchMovieData (startPage, totalPages){
    for(pi =  1; pi <= totalPages; ++pi){
        let page = pi.toString();
        
        const url2 = `https://api.themoviedb.org/3/movie/top_rated?api_key=${api_key}&language=en-US&page=${page}`;

        const req = await axios.get(url3)
        .then(function (response){
            console.log(response);

            for(i = 0 ; i < response.data.results.length; ++i){
                // console.log(response.data.results[i]);
                
                let {release_date, adult, id, overview, original_language, 
                    title, vote_average, vote_count, poster_path} = response.data.results[i];

                if (adult === true) adult = 'R';
                else adult = 'PG13';

            console.log(release_date + ' ' + id + ' ' + title + ' ' + vote_average );

            try {
                database.simpleExecute(`
                INSERT INTO movie (MOVIE_ID, TITLE,
                        DESCRIPTION, RELEASE_DATE, RATING, TOTAL_VOTES, IMAGE_URL, LANGUAGE, MATURITY_RATING)
                VALUES (:movie_id, :title, :overview, :release_date::date, 
                :vote_average, :vote_count, :poster_path, :lang, :adult) ON CONFLICT DO NOTHING;
`,
               {
                   movie_id : id,
                   title : title,
                   overview : overview,
                   release_date : release_date,
                   vote_average : vote_average,
                   vote_count : vote_count,
                   poster_path : poster_path,
                   lang : original_language,
                   adult : adult
               } );
        

               for(j = 0; j < response.data.results[i].genre_ids.length; ++j){
                let genre_id = response.data.results[i].genre_ids[j];
                console.log(response.data.results[i].genre_ids[j]);
                database.simpleExecute(`
                INSERT INTO movie_GENRE (MOVIE_ID, GENRE_ID) 
                    VALUES (:movie_id, :genre_id) ON CONFLICT DO NOTHING;
`, {
                        movie_id : id,
                        genre_id : genre_id
                });
                
               }
            } catch (err){
                console.log(err);
            }
            //TO_DATE(:release_date, 'yyyy-mm-dd')
            
        }

    }).catch(function (error) {
        console.log(error);
    }).then(function(){
        console.log('Yeah!');
    });
    }
    
    
}

async function fetchGenreData(){
    

    axios.get('https://api.themoviedb.org/3/genre/tv/list?api_key=e7bafd491af23dcc2cc134b14174e118&language=en-US').
    then(function (response) {
        for(i = 0 ; i < response.data.genres.length; ++i){
            let {id, name} = response.data.genres[i];
            try {
                database.simpleExecute(`
                INSERT INTO genre (GENRE_ID, NAME, CONTENTS)
                VALUES (:genre_id, :genre_name, 0) ON CONFLICT DO NOTHING;
`,
               {
                    genre_id : id,
                    genre_name : name   
               } );
            } catch (err){
                console.log(err);
            }
        }
    }).catch(function(err){
        console.log(err);
    });

}

async function fetchShowData(totalPages){
    for(pi =  1; pi <= totalPages; ++pi){
        let page = pi.toString();
        const req = await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${api_key}&language=en-US&page=${page}`)
        .then(async function (response){
            for(i = 0 ; i < response.data.results.length; ++i){
                // console.log(response.data.results[i]);
                
                let {first_air_date, id, overview, original_language, 
                    name, vote_average, vote_count, poster_path} = response.data.results[i];
                
                const resp = await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=e7bafd491af23dcc2cc134b14174e118&language=en-US`);

                let {episode_run_time, last_air_date, number_of_episodes, number_of_seasons, status} = resp.data;

                // console.log(adult);
                // console.log(title);
                // console.log(typeof id);
            // console.log(release_date + ' ' + id + ' ' + title + ' ' + vote_average );
                
            // if (status !== 'Ended') last_air_date = null;

            try {
                database.simpleExecute(`
                INSERT INTO show (SHOW_ID, TITLE,
                    DESCRIPTION, START_DATE, RATING, TOTAL_VOTES, IMAGE_URL, LANGUAGE, LENGTH, SEASONS, EPISODES, END_DATE)
               VALUES (:show_id, :title, :overview, :release_date::date, 
               :vote_average, :vote_count, :poster_path, :lang, :len, :seasons, :episodes, :last_air_date::date) ON CONFLICT DO NOTHING;
`,
               {
                   show_id : id,
                   title : name,
                   overview : overview,
                   release_date : first_air_date,
                   vote_average : vote_average,
                   vote_count : vote_count,
                   poster_path : poster_path,
                   lang : original_language,
                   len : episode_run_time[0],
                   seasons: number_of_seasons,
                   episodes : number_of_episodes,
                   last_air_date : last_air_date
               } );

               fetchEpisode(id);


               for(j = 0; j < response.data.results[i].genre_ids.length; ++j){
                    let genre_id = response.data.results[i].genre_ids[j];
                    // console.log(response.data.results[i].genre_ids[j]);
                    database.simpleExecute(`
                    INSERT INTO show_GENRE (SHOW_ID, GENRE_ID) 
                    VALUES (:show_id, :genre_id) ON CONFLICT DO NOTHING;
`, {
                        show_id : id,
                        genre_id : genre_id
                });
                
               }
            } catch (err){
                console.log(err);
            }
            //TO_DATE(:release_date, 'yyyy-mm-dd')
            
        }

    }).catch(function (error) {
        console.log(error);
    }).then(function(){
        console.log('Yeah!');
    });
    }
    
    
}

async function fetchGenreData(){
    

    axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=e7bafd491af23dcc2cc134b14174e118&language=en-US').
    then(function (response) {
        for(i = 0 ; i < response.data.genres.length; ++i){
            let {id, name} = response.data.genres[i];
            try {
                database.simpleExecute(`INSERT INTO genre (GENRE_ID, NAME, CONTENTS)
                VALUES (:genre_id, :genre_name, 0)`,
               {
                    genre_id : id,
                    genre_name : name   
               } );
            } catch (err){
                console.log(err);
            }
        }
    }).catch(function(err){
        console.log(err);
    });
}

async function movieCredits (totalPages){
    for(pi =  1; pi <= totalPages; ++pi){
        let page = pi.toString();
        const url2 = `https://api.themoviedb.org/3/movie/top_rated?api_key=${api_key}&language=en-US&page=${pi}`;

        await axios.get(url2)
        .then(async (response) => {
            for(i = 0 ; i < response.data.results.length; ++i){
                // console.log(response.data.results[i]);
                
                let {release_date, adult, id, overview, original_language, 
                    title, vote_average, vote_count, poster_path} = response.data.results[i];

                if (adult) adult = 'R';
                else adult = 'PG13';

            try {
               await axios.get(`
               https://api.themoviedb.org/3/movie/${id}/credits?api_key=${api_key}&language=en-US`).then( async (response) =>{
                    console.log(response.data.cast.length);
                    
                    for(i = 0; i < response.data.cast.length; ++i){
                        if (response.data.cast[i].known_for_department === 'Acting' || response.data.cast[i].known_for_department === 'Directing'){
                            
                            try {
                                await database.simpleExecute(`
                                INSERT INTO celeb (CELEB_ID, NAME) VALUES (:celeb_id, :celeb_name) ON CONFLICT DO NOTHING;
`, {
                                    celeb_id : response.data.cast[i].id,
                                    celeb_name : response.data.cast[i].name
                                });
                            console.log(response.data.cast[i].id, response.data.cast[i].name);

                                await database.simpleExecute(
                                    `INSERT INTO movie_CELEB (CELEB_ID, MOVIE_ID, ROLE) 
                                    VALUES (:celeb_id, :movie_id, :role) ON CONFLICT DO NOTHING;
`,{
                                        celeb_id : response.data.cast[i].id,
                                        movie_id : id,
                                        role : response.data.cast[i].known_for_department
                                    }
                                );


                            } catch (err){
                                console.log(err);
                            }
                        }
                    }

                    for(i = 0; i < response.data.crew.length; ++i){
                        if (response.data.crew[i].known_for_department === 'Acting' || response.data.crew[i].known_for_department === 'Directing'){
                            try {
                                await database.simpleExecute(`
                                    INSERT INTO celeb (CELEB_ID, NAME) VALUES (:celeb_id, :celeb_name) ON CONFLICT DO NOTHING;
`, {
                                    celeb_id : response.data.crew[i].id,
                                    celeb_name : response.data.crew[i].name
                                });
                            // console.log(response.data.cast[i].id, response.data.cast[i].name);

                                await database.simpleExecute(
                                    `INSERT INTO movie_CELEB (CELEB_ID, MOVIE_ID, ROLE) 
                                    VALUES (:celeb_id, :movie_id, :role) ON CONFLICT DO NOTHING;
`,{
                                        celeb_id : response.data.crew[i].id,
                                        movie_id : id,
                                        role : response.data.crew[i].known_for_department
                                    }
                                );


                            } catch (err){
                                console.log(err);
                            }
                        }
                    }

               }).catch(function (err1){
                   console.log(err1);
               });

            } catch (err){
                console.log(err);
            }
            //TO_DATE(:release_date, 'yyyy-mm-dd')
            
        }

    }).catch(function (error) {
        console.log(error);
    }).then(function(){
        console.log('Yeah!');
    });
    }
    
}

async function showCredits (totalPages){
    for(pi =  1; pi <= totalPages; ++pi){
        let page = pi.toString();
        await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${api_key}&language=en-US&page=${page}`)
        .then(async (resp) => {
            for(i = 0 ; i < resp.data.results.length; ++i){
                // console.log(response.data.results[i]);
                
                let {id} = resp.data.results[i];

               const response = await axios.get(`
               https://api.themoviedb.org/3/tv/${id}/credits?api_key=${api_key}&language=en-US`);
                
               console.log(id);     
               
               for(i = 0; i < response.data.cast.length; ++i){
                        if (response.data.cast[i].known_for_department === 'Acting' || response.data.cast[i].known_for_department === 'Directing'){
                            
                            try {
                                await database.simpleExecute(`
                                    INSERT INTO celeb (CELEB_ID, NAME) VALUES (:celeb_id, :celeb_name) ON CONFLICT DO NOTHING;
`, {
                                    celeb_id : response.data.cast[i].id,
                                    celeb_name : response.data.cast[i].name
                                });
                            } catch(err){
                                console.log(err);
                            }
                            
                            
                            try {
                                await database.simpleExecute(
                                    `INSERT INTO show_CELEB (CELEB_ID, SHOW_ID, ROLE) 
                                        VALUES (:celeb_id, :show_id, :role) ON CONFLICT DO NOTHING;
`,{
                                        celeb_id : response.data.cast[i].id,
                                        show_id : id,
                                        role : response.data.cast[i].known_for_department
                                    }
                                );


                            } catch (err){
                                console.log(err);
                            }
                        }
                    }

                    for(i = 0; i < response.data.crew.length; ++i){
                        if (response.data.crew[i].known_for_department === 'Acting' || response.data.crew[i].known_for_department === 'Directing'){
                            try {
                                await database.simpleExecute(`
                                    INSERT INTO celeb (CELEB_ID, NAME) VALUES (:celeb_id, :celeb_name) ON CONFLICT DO NOTHING;
`, {
                                    celeb_id : response.data.crew[i].id,
                                    celeb_name : response.data.crew[i].name
                                });
                            } catch(err){
                                console.log(err);
                            }
                            
                            
                            try {
                                await database.simpleExecute(
                                    `INSERT INTO show_CELEB (CELEB_ID, SHOW_ID, ROLE) 
                                    VALUES (:celeb_id, :show_id, :role) ON CONFLICT DO NOTHING;
`,{
                                        celeb_id : response.data.crew[i].id,
                                        show_id : id,
                                        role : response.data.crew[i].known_for_department
                                    }
                                );


                            } catch (err){
                                console.log(err);
                            }
                        }
                    }
            
        }

    }).catch(function (error) {
        console.log(error);
    }).then(function(){
        console.log('Yeah!');
    });
    }
    
}

async function fetchEpisode(id){
    const resp = await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=e7bafd491af23dcc2cc134b14174e118&language=en-US`);
                // console.log(resp.data);

    let {episode_run_time, last_air_date, number_of_episodes, number_of_seasons } = resp.data;

    for(i = 1; i <= number_of_seasons; ++i){
        const resp1 = await axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${i}?api_key=${api_key}&language=en-US`);

        for(j = 0; j < resp1.data.episodes.length; ++j){
            let {episode_number, season_number, name, overview, still_path } = resp1.data.episodes[j];

            try {
                await database.simpleExecute(`
                INSERT INTO episode 
                (SEASON_NO, EPISODE_NO, SHOW_ID, TITLE, DESCRIPTION, IMAGE_URL)
                VALUES (:s_no, :e_no, :show_id, :title, :description, :img_url) ON CONFLICT DO NOTHING;
`, {
                    s_no : season_number,
                    e_no : episode_number,
                    show_id : id,
                    title : name,
                    description: overview,
                    img_url : still_path
                });
                
            } catch (err){
                console.log(err);
            }
        }
    }

    
    
}

// fetchGenreData();
// fetchMovieData(1, 1);
// fetchShowData(20);
// movieCredits(20);
// showCredits(20);
// fetchEpisode(60059);

module.exports = {
    fetchMovieData,
    fetchShowData,
    fetchGenreData,
    movieCredits,
    showCredits,
    fetchEpisode,
};