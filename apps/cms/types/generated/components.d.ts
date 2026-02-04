import type { Schema, Struct } from '@strapi/strapi';

export interface HomepageBanner extends Struct.ComponentSchema {
  collectionName: 'components_homepage_banners';
  info: {
    description: 'Prom\u00F3ci\u00F3s banner k\u00E9p linkkel';
    displayName: 'Prom\u00F3 banner';
  };
  attributes: {
    cim: Schema.Attribute.String;
    gombSzoveg: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Tov\u00E1bb'>;
    hatterSzin: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#f6f6f6'>;
    kep: Schema.Attribute.Media<'images'>;
    leiras: Schema.Attribute.Text;
    link: Schema.Attribute.String;
  };
}

export interface HomepageBizalmiJelvenyek extends Struct.ComponentSchema {
  collectionName: 'components_homepage_bizalmi_jelvenyek';
  info: {
    description: 'Trust badge-ek pl. sz\u00E1ll\u00EDt\u00E1s, garancia, biztons\u00E1g';
    displayName: 'Bizalmi jelv\u00E9nyek';
  };
  attributes: {
    jelvenyek: Schema.Attribute.Component<'homepage.jelveny', true>;
    lathato: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface HomepageGyikSzekcio extends Struct.ComponentSchema {
  collectionName: 'components_homepage_gyik_szekciok';
  info: {
    description: 'Gyakran ism\u00E9telt k\u00E9rd\u00E9sek megjelen\u00EDt\u00E9se';
    displayName: 'GYIK szekci\u00F3';
  };
  attributes: {
    alcim: Schema.Attribute.String;
    cim: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Gyakran Ism\u00E9telt K\u00E9rd\u00E9sek'>;
    kerdesek: Schema.Attribute.Relation<'oneToMany', 'api::faq.faq'>;
    maxKerdes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
  };
}

export interface HomepageHero extends Struct.ComponentSchema {
  collectionName: 'components_homepage_heroes';
  info: {
    description: 'A f\u0151oldal fels\u0151 banner szekci\u00F3ja nagy c\u00EDmmel \u00E9s gombokkal';
    displayName: 'Hero szekci\u00F3';
  };
  attributes: {
    cimke: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Schema.Attribute.DefaultTo<'Professzion\u00E1lis t\u0171zv\u00E9delem'>;
    elsoGombLink: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/kapcsolat'>;
    elsoGombSzoveg: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'K\u00E9rjen aj\u00E1nlatot'>;
    focim: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Schema.Attribute.DefaultTo<'Biztons\u00E1g, amiben megb\u00EDzhat!'>;
    kepek: Schema.Attribute.Media<'images', true>;
    leiras: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    masodikGombLink: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/termekek'>;
    masodikGombSzoveg: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Term\u00E9kek b\u00F6ng\u00E9sz\u00E9se'>;
  };
}

export interface HomepageJelveny extends Struct.ComponentSchema {
  collectionName: 'components_homepage_jelvenyek';
  info: {
    description: 'Egyedi bizalmi jelv\u00E9ny ikon \u00E9s sz\u00F6veggel';
    displayName: 'Jelv\u00E9ny';
  };
  attributes: {
    cim: Schema.Attribute.String & Schema.Attribute.Required;
    ikon: Schema.Attribute.Enumeration<
      [
        'szallitas',
        'biztonsag',
        'tamogatas',
        'garancia',
        'mintet',
        'visszakuldes',
      ]
    > &
      Schema.Attribute.DefaultTo<'szallitas'>;
    ikonSzin: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#FFBB36'>;
    leiras: Schema.Attribute.String;
  };
}

export interface HomepageKategoriakSzekcio extends Struct.ComponentSchema {
  collectionName: 'components_homepage_kategoriak_szekciok';
  info: {
    description: 'Kateg\u00F3ria k\u00E1rty\u00E1k megjelen\u00EDt\u00E9se a f\u0151oldalon';
    displayName: 'Kateg\u00F3ri\u00E1k szekci\u00F3';
  };
  attributes: {
    cim: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Kateg\u00F3ri\u00E1k'>;
    kiemeltKategoriak: Schema.Attribute.Relation<
      'oneToMany',
      'api::category.category'
    >;
    megjelenitesLathato: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface HomepageTermekSzekcio extends Struct.ComponentSchema {
  collectionName: 'components_homepage_termek_szekciok';
  info: {
    description: 'Term\u00E9kek megjelen\u00EDt\u00E9se sliderben vagy r\u00E1csban';
    displayName: 'Term\u00E9k szekci\u00F3';
  };
  attributes: {
    alcim: Schema.Attribute.String;
    cim: Schema.Attribute.String & Schema.Attribute.Required;
    egyediTermekek: Schema.Attribute.Relation<
      'oneToMany',
      'api::product.product'
    >;
    maxTermekszam: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<8>;
    termekForras: Schema.Attribute.Enumeration<
      ['kiemelt', 'akcios', 'uj', 'egyedi']
    > &
      Schema.Attribute.DefaultTo<'kiemelt'>;
    tipus: Schema.Attribute.Enumeration<['slider', 'racs']> &
      Schema.Attribute.DefaultTo<'slider'>;
  };
}

export interface ProductCertification extends Struct.ComponentSchema {
  collectionName: 'components_product_certifications';
  info: {
    displayName: 'Certification';
  };
  attributes: {
    certificate: Schema.Attribute.Media<'files'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    standard: Schema.Attribute.String;
    validUntil: Schema.Attribute.Date;
  };
}

export interface ProductSpecification extends Struct.ComponentSchema {
  collectionName: 'components_product_specifications';
  info: {
    displayName: 'Specification';
  };
  attributes: {
    key: Schema.Attribute.String & Schema.Attribute.Required;
    unit: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata for pages';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'homepage.banner': HomepageBanner;
      'homepage.bizalmi-jelvenyek': HomepageBizalmiJelvenyek;
      'homepage.gyik-szekcio': HomepageGyikSzekcio;
      'homepage.hero': HomepageHero;
      'homepage.jelveny': HomepageJelveny;
      'homepage.kategoriak-szekcio': HomepageKategoriakSzekcio;
      'homepage.termek-szekcio': HomepageTermekSzekcio;
      'product.certification': ProductCertification;
      'product.specification': ProductSpecification;
      'shared.seo': SharedSeo;
    }
  }
}
