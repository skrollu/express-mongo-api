const dotenv = require('dotenv').config();
process.env.NODE_ENV = 'test' //to be in the test database environnement
process.env.PORT = 3000;

const request = require('supertest');
const { app } = require('../server');


describe('REST API: Movies test suite', () => {
    var id;
    
    it('post(/api/movies/add): Create a movie', async (done) => {
        await request(app).post('/api/movies/add')
        .send({
            "director": "Steven Spielberg",
            "plot": "A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose.",
            "poster": "https://static.posters.cz/image/750webp/75969.webp",
            "rated": "PG",
            "runtime": 127,
            "title": "Jurassic Park",
            "type": "movie",
            "year": 1993,
            "imdb": {
                "id": 123,
                "rating": 8.1,
                "votes": 858411
            },
            "metacritic": 68,
            "writers": [ "Michael Crichton (novel)", "Michael Crichton (screenplay)" ],
            "youtubeEmbedUrl": "https://www.youtube.com/watch?v=f4mvVh9R3ns",
            "genres": ["science-fiction"],
            "actors": ["Sam Neill","Laura Dern", "Jeff Goldblum",  "Richard Attenborough",  "Bob Peck"]
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.movie._id).toBeDefined();
            id = res.body.movie._id;
            done()
        })
    })

    it('get(/api/movies/): Fetch all movies', async (done) => {
        await request(app).get('/api/movies/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((err, res) => {
            done(res);
        });
    })
    
    it('get(api/movies/:id) Fetch by id a movie', async (done) => {
        await request(app).get(`/api/movies/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res, err) => {
            done(err)
        })
    })

    it('put(api/movies/:id) Update by id a movie', async (done) => {
        await request(app).put(`/api/movies/update/${id}`)
        .send({
            "director": "Stevenn Spielberg",
            "plot": "A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose.",
            "poster": "https://static.posters.cz/image/750webp/75969.webp",
            "rated": "PG",
            "runtime": 127,
            "title": "Jurassic Park",
            "type": "movie",
            "year": 1993,
            "imdb": {
                "id": 123,
                "rating": 8.1,
                "votes": 858411
            },
            "metacritic": 68,
            "writers": [ "Michael Crichton (novel)", "Michael Crichton (screenplay)" ],
            "youtubeEmbedUrl": "https://www.youtube.com/watch?v=f4mvVh9R3ns",
            "genres": ["science-fiction"],
            "actors": ["Sam Neill","Laura Dern", "Jeff Goldblum",  "Richard Attenborough",  "Bob Peck"]
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.movie._id).toBeDefined();
            expect(res.body.movie.director).toBe("Stevenn Spielberg");
            done()
        })
    })

    
    it('put(api/movies/:id) should return error because no data was sended', async (done) => {
        await request(app).put(`/api/movies/update/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res, err) => {
            expect(res.body.updated).toBeFalsy();
            expect(res.body.error).toMatch(/ERROR/);
            done(err)
        })
    })
    
    it('delete(api/movies/delete/:id) Delete a movie', async (done) => {
        await request(app).delete(`/api/movies/delete/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((err, res) => {
            if (err) return done(res, err);
            done();
        });
    })
});
