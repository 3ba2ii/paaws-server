"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetRepo = void 0;
const errors_1 = require("./../errors");
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const Pet_1 = require("./../entity/PetEntities/Pet");
const PetBreed_1 = require("../entity/PetEntities/PetBreed");
let PetRepo = class PetRepo extends typeorm_1.Repository {
    updatePetBreeds(breeds, pet) {
        const newBreeds = [];
        breeds.forEach((breed) => {
            const existingBreed = pet.breeds.find((pBreed) => pBreed.breed === breed);
            if (!existingBreed) {
                newBreeds.push(PetBreed_1.PetBreed.create({ breed }));
            }
            else {
                newBreeds.push(existingBreed);
            }
        });
        return newBreeds;
    }
    async updatePetInfo({ name, about, birthDate, breeds, gender, size, spayedOrNeutered, type, vaccinated, }, id) {
        try {
            const pet = await Pet_1.Pet.findOne(id);
            if (!pet)
                return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('pet')] };
            if (name)
                pet.name = name;
            if (birthDate)
                pet.birthDate = birthDate;
            if (gender)
                pet.gender = gender;
            if (size)
                pet.size = size;
            if (type)
                pet.type = type;
            if (breeds)
                pet.breeds = this.updatePetBreeds(breeds, pet);
            if (typeof vaccinated === 'boolean')
                pet.vaccinated = vaccinated;
            if (typeof spayedOrNeutered === 'boolean')
                pet.spayedOrNeutered = spayedOrNeutered;
            if (about)
                pet.about = about;
            await pet.save();
            return {
                pet,
            };
        }
        catch (e) {
            console.error(e);
            return {
                errors: [errors_1.INTERNAL_SERVER_ERROR],
            };
        }
    }
};
PetRepo = __decorate([
    (0, typedi_1.Service)(),
    (0, typeorm_1.EntityRepository)(Pet_1.Pet)
], PetRepo);
exports.PetRepo = PetRepo;
//# sourceMappingURL=Pet.repo.js.map