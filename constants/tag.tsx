export enum Tag {
    ANIMAL = 'tagAnimal',
    BUILDING = 'tagBuilding',
    CITY = 'tagCity',
    EARTH = 'tagEarth',
    EVENT = 'tagEvent',
    JOVIAN = 'tagJovian',
    MICROBE = 'tagMicrobe',
    PLANT = 'tagPlant',
    POWER = 'tagPower',
    SCIENCE = 'tagScience',
    SPACE = 'tagSpace',
    VENUS = 'tagVenus',
    WILD = 'tagWild',
    ANY = 'tagAny',
}

export type TagAmount = {
    tag: Tag;
    dividedBy?: number;
    includeOpponents?: boolean;
};
