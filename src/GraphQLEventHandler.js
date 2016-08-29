'use strict';

import deepcopy from 'deepcopy';

import EventHandlerBase from 'jmf';

// The name of the field storing the unique ids for each record
const ID_FIELD_NAME = '__id_unique';

// Defines the default values for a reference annotation
const ANNOTATION_REF_DEFAULT = {
  reference_type: 'list',
  containment: false,
  lower_bound: 0,
  upper_bound: -1
};

const ANNOTATION_ATTRIBUTE_DEFAULT = {
  lower_bound: 0,
  upper_bound: 1
};

const ANNOTATION_OBJECT_DEFAULT = {
  root: false
};

const ANNOTATION_REF_VALID_REFERENCE_TYPES = ['list', 'connection'];

const ATTR_TYPE_MAP = {
  string: 'GraphQLString',
  number: 'GraphQLInt',
  date: 'GraphQLInt',
  boolean: 'GraphQLBoolean'
};

/**
 * This handler creates a schema model for graphql
 */
export class GraphQLEventHandler extends EventHandlerBase {

  constructor(opts) {
    super(opts);

    if (this.annotation === undefined) {
      this.annotation = 'graphql';
    }

    if (opts.id_name === undefined) {
      this.id_name = ID_FIELD_NAME;
    } else {
      this.id_name = opts.id_name;
    }
  }

  /**
   * initializes a new object
   * @public
   * @param {string} objectName - The name of the object to be created
   * @param {object} config - The complete configuration of this object
   */
  initObject(objectName, config) {
    super.initObject(objectName, config);

    this.model[objectName] = {
      description: '',
      attributes: {},
      references: {}
    };

    if (config.description !== undefined) {
      this.model[objectName].description = config.description;
    } else {
      this.model[objectName].description = '';
    }

    this._validateAnnotationBase(config, ANNOTATION_OBJECT_DEFAULT);
    this.model[objectName].annotations = config.annotations;
  }

  /**
   * Handles the creation of an attribute for an object
   * @public
   * @param {string} objectName - The name of the object to be created
   * @param {string} attributeName - The name of the attribute to be created for this object
   * @param {object} attrConfig - The configuration of this attribute
   */
  handleAttribute(objectName, attributeName, attrConfig) {
    super.handleAttribute(objectName, attributeName, attrConfig);
    this._validateAnnotationAttribute(objectName, attributeName, attrConfig);

    const newAttrConfig = deepcopy(attrConfig);
    newAttrConfig.type = ATTR_TYPE_MAP[attrConfig.type];

    this.model[objectName].attributes[attributeName] = newAttrConfig;
  }

  /**
   * Validates the attribute annotation and fill it with the defaut values
   * @param {string} objectName - The name of the object to be created
   * @param {string} attributeName - The name of the attribute to be created for this object
   * @param {object} config - The configuration for this attribute
   */
  _validateAnnotationAttribute(objectName, attributeName, config) {
    this._validateAnnotationBase(config, ANNOTATION_ATTRIBUTE_DEFAULT);

  }

  /**
   * Validates the attribute annotation and fill it with the defaut values
   * @param {string} objectName - The name of the object to be created
   * @param {string} referenceName - The name of the reference to be created for this object
   * @param {object} config - The configuration for this attribute
   */
  _validateAnnotationReference(objectName, referenceName, config) {
    this._validateAnnotationBase(config, ANNOTATION_REF_DEFAULT);

    const annotation = config.annotations[this.getAnnotationName()];

    // upper_bound must not equal '0'
    if (annotation.upper_bound === 0) {
      this.handleError(objectName, 'reference', referenceName,
        `The 'upper_bound' attribute in the '${this.getAnnotationName()}' annotation must not equal '0'`);
    }

    // validate the reference type
    const refType = annotation.reference_type;
    if (ANNOTATION_REF_VALID_REFERENCE_TYPES.indexOf(refType) === -1) {
      // eslint-disable-next-line max-len
      this.handleError(objectName, 'reference', referenceName, `The 'reference_type' attribute '${refType}' in the '${this.getAnnotationName()}' is not valid. It must be one of ${ANNOTATION_REF_VALID_REFERENCE_TYPES.join(',')}`);
    }
  }

  /**
   * Set the default annotation values for a given config
   * @param {object} config - The configuration to add the annotation defaults to
   * @param {object} defaults - The object with the annotation defaults
   */
  _validateAnnotationBase(config, defaults) {
    const annoName = this.getAnnotationName();
    if (config.annotations === undefined) {
      config.annotations = {};
    }

    if (config.annotations[annoName] === undefined) {
      config.annotations[annoName] = {};
    }

    const annotation = config.annotations[annoName];

    // set the default values
    Object.keys(defaults).forEach(key => {
      if (annotation[key] === undefined) {
        annotation[key] = defaults[key];
      }
    });

  }

  /**
   * Handles the creation of a reference for an object
   * @public
   * @param {string} objectName - The name of the object to be created
   * @param {string} referenceName - The name of the reference to be created for this object
   * @param {object} refConfig - The configuration of this reference
   */
  handleReference(objectName, referenceName, refConfig) {
    super.handleReference(objectName, referenceName, refConfig);
    this._validateAnnotationReference(objectName, referenceName, refConfig);

    const newRefConfig = deepcopy(refConfig);

    this.model[objectName].references[referenceName] = newRefConfig;



    // check that the reference name does not exists as an attribute name
    if (this.model[objectName].attributes !== undefined && this.model[objectName].attributes[referenceName] !== undefined) {
      this.handleError(objectName, 'reference', referenceName, `The reference name '${referenceName}' does already exists as an attribute.`);
    } else if (newRefConfig.target === undefined) {
      // validate that the target attribute exists
      this.handleError(objectName, 'reference', referenceName, `The target attribute of the reference '${referenceName}' does not exists`);
    } else if (this.model[newRefConfig.target] === undefined) {
      // validate that the target exists
      this.handleError(objectName, 'reference', referenceName,
        `The referenced target '${newRefConfig.target}' of the reference '${referenceName}' does not exists`);
    } else {
      // store the reference
      this.model[objectName].references[referenceName] = newRefConfig;
    }



  }

  /**
   * returns the converted model as string
   * @public
   * @returns {string} The new created data as string
   */
  getConfig() {
    return JSON.stringify(this.model);
  }
}
