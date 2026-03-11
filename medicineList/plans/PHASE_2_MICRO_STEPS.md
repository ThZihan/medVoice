# Phase 2: Prepare for MedVoice Merge - Micro-Steps

## Overview

This document breaks down Phase 2 into small, implementable micro-steps. Each step can be completed independently and tested before moving to the next step.

---

## Step 2.1: Create Medicine List Django App Structure

**Goal**: Ensure the `medicines` app is self-contained and portable.

### 2.1.1: Create `medicine_list/urls.py`
- [ ] Create `backend/medicines/urls.py` file
- [ ] Define URL patterns for all medicine list endpoints
- [ ] Include namespace prefix `/api/medicine-list/`

### 2.1.2: Review and Clean `medicines/models.py`
- [ ] Review all models for PostgreSQL compatibility
- [ ] Add missing indexes for performance
- [ ] Add `__str__` methods if missing
- [ ] Add Meta class with table names
- [ ] Document model relationships

### 2.1.3: Review and Clean `medicines/views.py`
- [ ] Check all views for security issues
- [ ] Ensure proper error handling
- [ ] Add API versioning support
- [ ] Document each view function
- [ ] Remove any hardcoded URLs

### 2.1.4: Update `medicines/admin.py`
- [ ] Register all models in admin
- [ ] Add list_display, list_filter, search_fields
- [ ] Add custom admin actions if needed
- [ ] Test admin interface

### 2.1.5: Create `medicines/__init__.py`
- [ ] Ensure `__init__.py` exists and is properly configured
- [ ] Add default app config if needed

---

## Step 2.2: Extract Shared Services

**Goal**: Extract reusable services for MedVoice integration.

### 2.2.1: Create `ai_services/` directory
- [ ] Create `backend/ai_services/__init__.py`
- [ ] Create `backend/ai_services/gemini_service.py`
- [ ] Create `backend/ai_services/glm_service.py`

### 2.2.2: Implement `gemini_service.py`
- [ ] Extract OCR functionality from `views.py`
- [ ] Create `extract_medicine_from_image(image)` function
- [ ] Create `extract_text_from_image(image)` function
- [ ] Add error handling and retry logic
- [ ] Add rate limiting

### 2.2.3: Implement `glm_service.py`
- [ ] Create base GLM service class
- [ ] Add `generate_review_from_qa(answers)` method
- [ ] Add `moderate_content(content)` method
- [ ] Add `structure_review(content)` method
- [ ] Add error handling

### 2.2.4: Create `utils/` directory
- [ ] Create `backend/utils/__init__.py`
- [ ] Create `backend/utils/pdf_generator.py`
- [ ] Create `backend/utils/color_calculator.py`

### 2.2.5: Implement `pdf_generator.py`
- [ ] Extract PDF generation logic from frontend
- [ ] Create `generate_medicine_pdf(medicines, patient, colors)` function
- [ ] Add support for custom templates
- [ ] Add error handling

### 2.2.6: Implement `color_calculator.py`
- [ ] Extract color blending logic from frontend
- [ ] Create `blend_colors(color1, color2)` function
- [ ] Create `generate_color_variations(base_color)` function
- [ ] Add validation for hex colors

---

## Step 2.3: Prepare Database for PostgreSQL

**Goal**: Ensure models are PostgreSQL-ready.

### 2.3.1: Review Database Settings
- [ ] Check current database configuration
- [ ] Verify PostgreSQL driver is in requirements.txt
- [ ] Add connection pooling settings
- [ ] Configure timezone settings

### 2.3.2: Create PostgreSQL Migration
- [ ] Review existing migrations
- [ ] Create new migration for PostgreSQL-specific changes
- [ ] Test migration on local PostgreSQL instance
- [ ] Document any manual migration steps needed

### 2.3.3: Update Models for PostgreSQL
- [ ] Add `ArrayField` for timing schedules if needed
- [ ] Add `JSONField` for flexible data storage
- [ ] Add `UUIDField` for primary keys if needed
- [ ] Add `GinIndex` for text search

### 2.3.4: Create Database Diagram
- [ ] Document ER diagram for medicine list models
- [ ] Document relationships with MedVoice models
- [ ] Create migration path document

---

## Step 2.4: Create Integration Documentation

**Goal**: Document how to integrate with MedVoice.

### 2.4.1: Create API Documentation
- [ ] Document all API endpoints
- [ ] Add request/response examples
- [ ] Document authentication requirements
- [ ] Document error codes
- [ ] Add rate limiting information

### 2.4.2: Create Model Documentation
- [ ] Document all models and fields
- [ ] Document model relationships
- [ ] Document model methods
- [ ] Add migration notes

### 2.4.3: Create Integration Guide
- [ ] Write step-by-step integration guide
- [ ] Document settings changes needed
- [ ] Document URL configuration
- [ ] Document authentication integration
- [ ] Document shared services usage

### 2.4.4: Create Testing Guide
- [ ] Document unit tests needed
- [ ] Document integration tests needed
- [ ] Document E2E test scenarios
- [ ] Document performance benchmarks

---

## Step 2.5: Prepare Authentication Integration

**Goal**: Prepare authentication to work with MedVoice.

### 2.5.1: Review Current Authentication
- [ ] Document current auth flow
- [ ] Identify auth dependencies
- [ ] Document session management
- [ ] Document CSRF protection

### 2.5.2: Create Auth Adapter
- [ ] Create `backend/medicines/auth_adapters.py`
- [ ] Create `MedVoiceAuthBackend` class
- [ ] Add support for phone OTP
- [ ] Add support for JWT tokens
- [ ] Add support for Google OAuth

### 2.5.3: Update Views for MedVoice Auth
- [ ] Update login view to use MedVoice auth
- [ ] Update register view to use MedVoice auth
- [ ] Add logout integration
- [ ] Add user profile sync

### 2.5.4: Create User Profile Extension
- [ ] Create `backend/medicines/signals.py`
- [ ] Create `create_patient_profile` signal handler
- [ ] Connect to MedVoice user creation
- [ ] Test profile creation flow

---

## Step 2.6: Update Configuration

**Goal**: Prepare settings for MedVoice integration.

### 2.6.1: Create Settings Module
- [ ] Create `backend/medicines/settings.py`
- [ ] Define medicine list specific settings
- [ ] Add default color palette settings
- [ ] Add OCR configuration
- [ ] Add PDF generation settings

### 2.6.2: Update Main Settings
- [ ] Document required settings for MedVoice
- [ ] Add conditional app loading
- [ ] Add middleware configuration
- [ ] Add static files configuration

### 2.6.3: Create Environment Variables
- [ ] Update `.env.example` with MedVoice variables
- [ ] Document all required variables
- [ ] Add validation for environment variables
- [ ] Create settings validation function

### 2.6.4: Update Requirements
- [ ] Add PostgreSQL driver
- [ ] Add pgvector support
- [ ] Add Celery dependencies
- [ ] Add Redis dependencies
- [ ] Update version numbers

---

## Step 2.7: Create Tests

**Goal**: Ensure code quality before merge.

### 2.7.1: Create Unit Tests
- [ ] Create `backend/medicines/tests/test_models.py`
- [ ] Create `backend/medicines/tests/test_views.py`
- [ ] Create `backend/medicines/tests/test_urls.py`
- [ ] Create `backend/ai_services/tests/test_gemini.py`
- [ ] Create `backend/ai_services/tests/test_glm.py`

### 2.7.2: Create Integration Tests
- [ ] Create `backend/tests/test_medicine_list_integration.py`
- [ ] Test OCR functionality
- [ ] Test PDF generation
- [ ] Test color calculations
- [ ] Test API endpoints

### 2.7.3: Create Performance Tests
- [ ] Test database query performance
- [ ] Test API response times
- [ ] Test concurrent user access
- [ ] Document performance baselines

### 2.7.4: Create Security Tests
- [ ] Test SQL injection protection
- [ ] Test XSS protection
- [ ] Test CSRF protection
- [ ] Test rate limiting
- [ ] Test authentication bypass attempts

---

## Step 2.8: Create Deployment Checklist

**Goal**: Prepare for production deployment.

### 2.8.1: Create Migration Checklist
- [ ] Document pre-migration steps
- [ ] Document migration execution steps
- [ ] Document post-migration verification
- [ ] Document rollback procedures

### 2.8.2: Create Deployment Checklist
- [ ] Document environment setup
- [ ] Document database migration
- [ ] Document static file collection
- [ ] Document service restart procedures
- [ ] Document health checks

### 2.8.3: Create Monitoring Setup
- [ ] Document logging configuration
- [ ] Document metrics to track
- [ ] Document alert thresholds
- [ ] Create dashboard requirements

### 2.8.4: Create Backup Strategy
- [ ] Document database backup procedures
- [ ] Document file backup procedures
- [ ] Document backup retention policy
- [ ] Document disaster recovery procedures

---

## Step 2.9: Final Verification

**Goal**: Ensure everything is ready for Phase 3.

### 2.9.1: Code Review Checklist
- [ ] All code follows PEP 8
- [ ] All functions have docstrings
- [ ] All error cases handled
- [ ] No hardcoded credentials
- [ ] No debug code in production paths

### 2.9.2: Integration Readiness Checklist
- [ ] All tests pass
- [ ] All documentation complete
- [ ] All settings configurable
- [ ] All dependencies documented
- [ ] All security measures in place

### 2.9.3: Performance Checklist
- [ ] Database queries optimized
- [ ] API responses under 200ms
- [ ] Static files properly cached
- [ ] No memory leaks
- [ ] No blocking operations

### 2.9.4: Create Phase 3 Handoff Document
- [ ] Summarize all changes
- [ ] List all new files
- [ ] List all modified files
- [ ] Provide integration instructions
- [ ] Provide rollback instructions

---

## Execution Order

Execute steps in numerical order. Each step should be:
1. Implemented
2. Tested
3. Committed to git
4. Documented as complete

Before moving to next step, verify:
- Code works as expected
- Tests pass
- Documentation is updated
- Git is clean

---

## Progress Tracking

| Step | Status | Notes |
|-------|---------|--------|
| 2.1.1 | ⬜ |  |
| 2.1.2 | ⬜ |  |
| 2.1.3 | ⬜ |  |
| 2.1.4 | ⬜ |  |
| 2.1.5 | ⬜ |  |
| 2.2.1 | ⬜ |  |
| 2.2.2 | ⬜ |  |
| 2.2.3 | ⬜ |  |
| 2.2.4 | ⬜ |  |
| 2.2.5 | ⬜ |  |
| 2.2.6 | ⬜ |  |
| 2.3.1 | ⬜ |  |
| 2.3.2 | ⬜ |  |
| 2.3.3 | ⬜ |  |
| 2.3.4 | ⬜ |  |
| 2.4.1 | ⬜ |  |
| 2.4.2 | ⬜ |  |
| 2.4.3 | ⬜ |  |
| 2.4.4 | ⬜ |  |
| 2.5.1 | ⬜ |  |
| 2.5.2 | ⬜ |  |
| 2.5.3 | ⬜ |  |
| 2.5.4 | ⬜ |  |
| 2.6.1 | ⬜ |  |
| 2.6.2 | ⬜ |  |
| 2.6.3 | ⬜ |  |
| 2.6.4 | ⬜ |  |
| 2.7.1 | ⬜ |  |
| 2.7.2 | ⬜ |  |
| 2.7.3 | ⬜ |  |
| 2.7.4 | ⬜ |  |
| 2.8.1 | ⬜ |  |
| 2.8.2 | ⬜ |  |
| 2.8.3 | ⬜ |  |
| 2.8.4 | ⬜ |  |
| 2.9.1 | ⬜ |  |
| 2.9.2 | ⬜ |  |
| 2.9.3 | ⬜ |  |
| 2.9.4 | ⬜ |  |

---

*Created: 2026-03-11*
*Status: Ready for Execution*
