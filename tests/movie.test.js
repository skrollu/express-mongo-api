const dotenv = require('dotenv').config();
process.env.NODE_ENV = 'test' //to be in the test database environnement
process.env.PORT = 3000;

const session = require('supertest-session');
const { app, server } = require('../server');
const { Account } = require('../database/models/account');
const { Movie } = require('../database/models/movie');
const { disconnectDb } = require("../database/database")

const port = process.env.PORT;

const express = app.listen({ port: port }, () => {
    console.log(`🚀 GraphQL server ready at http://localhost:${port}${server.graphqlPath}`)
    console.log(`🚀 REST API server ready at http://localhost:${port}`)
});

//var cookie;
var testSession = session(express, { });

const adminAccount = {
    "username": "test_user",
    "password": "123",
}

const adminAccountToCreate = {
    "username": "test_user",
    "password": "123",
    "userType": "admin"
}

describe('REST API test suites', () => {
    
    beforeAll( async (done) => {
        await Movie.deleteMany({});
        await Account.deleteMany({});
        done();
    })
    
    afterAll( async (done) => {
        await Account.deleteMany({})
        await Movie.deleteMany({});
        disconnectDb();
        express.close(done);
    });
    
    describe('REST API: Register account test suite', () => {   
        
        afterAll( async (done) => {
            await Account.deleteMany({})
            await Movie.deleteMany({});
            done();
        });
        
        it('post(/api/users/register): Register a new account', async (done) => {
            await session(express).post('/api/users/register')
            .set('Accept', 'application/json')
            .send(adminAccountToCreate)
            .expect((res) => {
                expect(res.body.message).toBeDefined();
                expect(res.body.registered).toBeTruthy();
                done()
            })
        })
        
        it('post(/api/users/register): Register the same account will throw an error', async (done) => {
            await session(express).post('/api/users/register')
            .set('Accept', 'application/json')
            .send(adminAccountToCreate)
            .expect(400)
            .then((res) => {
                expect(res.body.error).toBeDefined();
                expect(res.body.registered).toBeFalsy();
                done()
            })
        })
    });
    
    describe('REST API: Login and logged Account routes test suite', () => {
        
        
        beforeAll( async (done) => {
            await Account.deleteMany({});
            await Movie.deleteMany({});
            done();
        })
        
        afterAll( async (done) => {
            await Account.deleteMany({})
            await Movie.deleteMany({});
            done();
        });
             
        it('post(/api/users/register): Register a new account', async (done) => {
            await session(express).post('/api/users/register')
            .set('Accept', 'application/json')
            .send(adminAccountToCreate)
            .expect((res) => {
                expect(res.body.message).toBeDefined();
                expect(res.body.registered).toBeTruthy();
                done()
            })
        })
                        
        it('post(/api/users/login): Login with the account previously created', async (done) => {
            await testSession.post('/api/users/login')
            .set('Accept', 'application/json')
            .send(adminAccount)
            .expect(200)
            .then((res) => {
                expect(res.body.message).toEqual("Successfully logged in !");
                expect(res.body.logged).toBeTruthy();
                /*console.log(res.header)
                cookie = res.header['connect.sid'];
                console.log("cookie = "  + cookie) */
                done()
            })
        })
        
        it('delete(/api/users/delete): delete previously created account and logout', async (done) => {
            await testSession.delete('/api/users/delete')
            .set('Accept', 'application/json')
            //.set('Cookie', cookie)
            .then((res) => {
                expect(res.body.deleted).toBeTruthy();
                expect(res.body.user).toBeDefined();
                expect(res.body.user._id).toBeDefined();
                done()
            })
        })
        
        it('get(/api/users/logout): Logout previously logged in account should get error because already logged out when deleting account', async (done) => {
            await testSession.get('/api/users/logout')
            .expect(401)
            .then((res) => {
                expect(res.body.logged).toBeDefined();
                expect(res.body.logged).toBeFalsy();
                expect(res.body.error).toMatch(/ERROR/);
                done()
            })
        })
        
        it('post(/api/users/register): Register a new account', async (done) => {
            await session(app).post('/api/users/register')
            .set('Accept', 'application/json')
            .send(adminAccountToCreate)
            .expect((res) => {
                expect(res.body.message).toBeDefined();
                expect(res.body.registered).toBeTruthy();
                done()
            })
        })
        
        it('post(/api/users/login): Login with the previously created account', async (done) => {
            await testSession.post('/api/users/login')
            .set('Accept', 'application/json')
            .send(adminAccount)
            .expect(200)
            .then((res) => {
                done()
            })
        })
        
        it('get(/api/users/logout): Logout previously logged in account', async (done) => {
            await testSession.get('/api/users/logout')
            .expect(200)
            .then((res) => {
                expect(res.body.message).toEqual("Successfully logged out !");
                expect(res.body.logged).toBeFalsy();
                done()
            })
        })
        
        it('delete(/api/users/delete): delete previously created account', async (done) => {
            await testSession.delete('/api/users/delete')
            .set('Accept', 'application/json')
            .expect(401)
            .then((res) => {
                expect(res.body.logged).toBeDefined();
                expect(res.body.logged).toBeFalsy();
                expect(res.body.error).toMatch(/ERROR/);
                done()
            })
        })
    });
    
    
    describe('REST API: Movies routes and movies logged routes test suite', () => {
        var id;
        
        afterAll( async (done) => {
            await Account.deleteMany({})
            await Movie.deleteMany({});
            done()
        })
        
        it('post(/api/users/register): Register a new account', async (done) => {
            await session(app).post('/api/users/register')
            .set('Accept', 'application/json')
            .send(adminAccountToCreate)
            .expect((res) => {
                expect(res.body.message).toBeDefined();
                expect(res.body.registered).toBeTruthy();
                done()
            })
        })
        
        
        it('post(/api/users/login): Login with the account previously created', async (done) => {
            await testSession.post('/api/users/login')
            .set('Accept', 'application/json')
            .send(adminAccount)
            .expect(200)
            .then((res) => {
                done()
            })
        })
        
        it('post(/api/movies/add): Create a movie', async (done) => {
            await testSession.post('/api/movies/add')
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
            await testSession.get('/api/movies/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((err, res) => {
                done(res);
            });
        })
        
        it('get(api/movies/:id) Fetch by id a movie', async (done) => {
            await testSession.get(`/api/movies/${id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res, err) => {
                done(err)
            })
        })
        
        it('put(api/movies/:id) Update by id a movie', async (done) => {
            await testSession.put(`/api/movies/update/${id}`)
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
            await testSession.put(`/api/movies/update/${id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then((res, err) => {
                expect(res.body.updated).toBeFalsy();
                expect(res.body.error).toMatch(/ERROR/);
                done(err)
            })
        })
        
        it('delete(api/movies/delete/:id) Delete a movie', async (done) => {
            await testSession.delete(`/api/movies/delete/${id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((err, res) => {
                if (err) return done(res, err);
                done();
            });
        })
        
        it('delete(/api/users/delete): delete previously created account', async (done) => {
            await testSession.delete('/api/users/delete')
            .set('Accept', 'application/json')
            //.set('Cookie', cookie)
            .then((res) => {
                expect(res.body.deleted).toBeTruthy();
                expect(res.body.user).toBeDefined();
                expect(res.body.user._id).toBeDefined();
                done()
            })
        })
    });
});