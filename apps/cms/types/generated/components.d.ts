import type { Schema, Struct } from '@strapi/strapi';

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
      'product.certification': ProductCertification;
      'product.specification': ProductSpecification;
      'shared.seo': SharedSeo;
    }
  }
}
