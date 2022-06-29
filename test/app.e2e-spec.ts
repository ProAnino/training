import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import * as pactum from 'pactum';
import { AuthDto } from "src/auth/dto";
import { EditUserDto } from "src/user/dto";
import { CreateBookmarkDto, EditBookmarkDto } from "src/bookmark/dto";


describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
            }),
        );
        await app.init();
        await app.listen(3333);

        prisma = app.get(PrismaService);

        await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3333');
    });

    afterAll(() => {
        app.close();
    });

    describe('Auth', () => {
        const dto: AuthDto = {
            email: 'hibou@chon.com',
            password: '123'
        };
        describe('Signup', () => {
            it('should error if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup',)
                    .withBody({ password: dto.password })
                    .expectStatus(400)
            })
            it('should error if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup',)
                    .withBody({ email: dto.email })
                    .expectStatus(400)
            })
            it('should error if no dto', () => {
                return pactum
                    .spec()
                    .post('/auth/signup',)
                    .expectStatus(400)
            })
            it('should sign up', () => {
                return pactum
                    .spec()
                    .post('/auth/signup',)
                    .withBody(dto)
                    .expectStatus(201)
            })
        });

        describe('Signin', () => {
            it('should error if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin',)
                    .withBody({ password: dto.password })
                    .expectStatus(400)
            })
            it('should error if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin',)
                    .withBody({ email: dto.email })
                    .expectStatus(400)
            })
            it('should error if no dto', () => {
                return pactum
                    .spec()
                    .post('/auth/signin',)
                    .expectStatus(400)
            })
            it('should sign in', () => {
                return pactum
                    .spec()
                    .post('/auth/signin',)
                    .withBody(dto)
                    .expectStatus(200)
                    .stores('accessToken', 'access_token')
            })
        });

    });

    describe('User', () => {
        describe('Get me', () => {
            it('should get me', () => {
                return pactum
                    .spec()
                    .get('/uers/me')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    });
            })
        });
        describe('Edit user', () => {
            it('should edit user', () => {
                const dto: EditUserDto = {
                    firstName: "Marco",
                    lastName: "Polo",
                    email: "tirbou@chon.com"
                }
                return pactum
                    .spec()
                    .patch('/users')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.firstName)
                    .expectBodyContains(dto.lastName)
                    .expectBodyContains(dto.email);
            })
        });
    });

    describe('Bookmark', () => {
        describe('Get empty bookmarks', () => {
            it('should get 0 bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .expectStatus(200)
                    .expectBody([]);
            })
        });
        describe('Create bookmark', () => {
            const dto: CreateBookmarkDto = {
                title: "super-titre",
                description: "biographie du génialissime Thomas",
                link: "va-en-enfer.com"
            }
            it('should create bookmark', () => {
                return pactum
                    .spec()
                    .post('/bookmarks/bookmark')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .withBody(dto)
                    .expectStatus(201)
                    .stores('bookMarkId', 'id');
            })
        });
        describe('Get bookmarks', () => {
            it('should get all bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .expectStatus(200)
                    .expectJsonLength(1);

            })
        });
        describe('Get bookmark by id', () => {
            it('should get one bookmark by id', () => {
                return pactum
                    .spec()
                    .get('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookMarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .expectStatus(200)
                    .expectBodyContains('$S{bookMarkId}')
            })
        });
        describe('Update bookmark by id', () => {
            const dto: EditBookmarkDto = {
                title: "super-titre-remplaçant",
                description: "biographie du génialissime Thomas 2",
                link: "va-au-paradis.com"
            }
            it('should update a bookmark', () => {
                return pactum
                    .spec()
                    .patch('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookMarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.description)
                    .expectBodyContains(dto.title)
                    .expectBodyContains(dto.link)
            })
        });
        describe('Delete bookmark by id', () => {
            it('should delete a bookmark', () => {
                return pactum
                    .spec()
                    .delete('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookMarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .expectStatus(204)
            })

            it('should get 0 bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}'
                    })
                    .expectStatus(200)
                    .expectBody([]);
            })
        });
    });
})