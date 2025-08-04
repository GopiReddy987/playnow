import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Ground {
  id: string;
  name: string;
  location: string;
  sport: string;
  imageUrl: string;
  pricePerHour: number;
  description: string;
  address: string;
  city: string;
  capacity: number;
  isAvailable: boolean;
  timings: TurfTiming[];
  amenities: TurfAmenity[];
}

interface TurfTiming {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  isAvailable: boolean;
}

interface TurfAmenity {
  name: string;
  description?: string;
  isAvailable: boolean;
  additionalCost?: number;
}

@Component({
  selector: 'app-ground-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="ground-management-container">
      <h1>Ground Management</h1>
      
      <!-- Add/Edit Ground Form -->
      <form [formGroup]="groundForm" (ngSubmit)="onSubmit()" class="ground-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Ground Name *</label>
              <input formControlName="name" type="text" placeholder="Enter ground name" />
              <div class="error" *ngIf="groundForm.get('name')?.invalid && groundForm.get('name')?.touched">
                Ground name is required
              </div>
            </div>
            <div class="form-group">
              <label>Sport Type *</label>
              <select formControlName="sportType">
                <option value="">Select sport</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Basketball">Basketball</option>
                <option value="Volleyball">Volleyball</option>
              </select>
              <div class="error" *ngIf="groundForm.get('sportType')?.invalid && groundForm.get('sportType')?.touched">
                Sport type is required
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Description *</label>
            <textarea formControlName="description" placeholder="Enter ground description" rows="3"></textarea>
            <div class="error" *ngIf="groundForm.get('description')?.invalid && groundForm.get('description')?.touched">
              Description is required
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Address *</label>
              <input formControlName="address" type="text" placeholder="Enter address" />
              <div class="error" *ngIf="groundForm.get('address')?.invalid && groundForm.get('address')?.touched">
                Address is required
              </div>
            </div>
            <div class="form-group">
              <label>City *</label>
              <input formControlName="city" type="text" placeholder="Enter city" />
              <div class="error" *ngIf="groundForm.get('city')?.invalid && groundForm.get('city')?.touched">
                City is required
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Postal Code *</label>
              <input formControlName="postalCode" type="text" placeholder="Enter postal code" />
              <div class="error" *ngIf="groundForm.get('postalCode')?.invalid && groundForm.get('postalCode')?.touched">
                Postal code is required
              </div>
            </div>
            <div class="form-group">
              <label>Capacity *</label>
              <input formControlName="capacity" type="number" placeholder="Enter capacity" min="1" />
              <div class="error" *ngIf="groundForm.get('capacity')?.invalid && groundForm.get('capacity')?.touched">
                Capacity is required
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Base Price Per Hour (₹) *</label>
              <input formControlName="pricePerHour" type="number" placeholder="Enter price per hour" min="0" step="0.01" />
              <div class="error" *ngIf="groundForm.get('pricePerHour')?.invalid && groundForm.get('pricePerHour')?.touched">
                Price per hour is required
              </div>
            </div>
            <div class="form-group">
              <label>Image URL</label>
              <input formControlName="imageUrl" type="url" placeholder="Enter image URL" />
            </div>
          </div>

          <div class="form-group">
            <label>
              <input formControlName="isAvailable" type="checkbox" />
              Available for Booking
            </label>
          </div>
        </div>

        <!-- Timing Section -->
        <div class="form-section">
          <h3>Timing & Pricing</h3>
          <div formArrayName="timings">
            <div *ngFor="let timing of timingsArray.controls; let i = index" [formGroupName]="i" class="timing-item">
              <div class="form-row">
                <div class="form-group">
                  <label>Day</label>
                  <select formControlName="dayOfWeek">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Start Time</label>
                  <input formControlName="startTime" type="time" />
                </div>
                <div class="form-group">
                  <label>End Time</label>
                  <input formControlName="endTime" type="time" />
                </div>
                <div class="form-group">
                  <label>Price/Hour (₹)</label>
                  <input formControlName="pricePerHour" type="number" min="0" step="0.01" />
                </div>
                <div class="form-group">
                  <label>
                    <input formControlName="isAvailable" type="checkbox" />
                    Available
                  </label>
                </div>
                <button type="button" class="btn-remove" (click)="removeTiming(i)">Remove</button>
              </div>
            </div>
            <button type="button" class="btn-add" (click)="addTiming()">+ Add Timing</button>
          </div>
        </div>

        <!-- Amenities Section -->
        <div class="form-section">
          <h3>Amenities</h3>
          <div formArrayName="amenities">
            <div *ngFor="let amenity of amenitiesArray.controls; let i = index" [formGroupName]="i" class="amenity-item">
              <div class="form-row">
                <div class="form-group">
                  <label>Amenity Name</label>
                  <input formControlName="name" type="text" placeholder="e.g., Changing Room" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <input formControlName="description" type="text" placeholder="Optional description" />
                </div>
                <div class="form-group">
                  <label>Additional Cost (₹)</label>
                  <input formControlName="additionalCost" type="number" min="0" step="0.01" placeholder="0" />
                </div>
                <div class="form-group">
                  <label>
                    <input formControlName="isAvailable" type="checkbox" />
                    Available
                  </label>
                </div>
                <button type="button" class="btn-remove" (click)="removeAmenity(i)">Remove</button>
              </div>
            </div>
            <button type="button" class="btn-add" (click)="addAmenity()">+ Add Amenity</button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="groundForm.invalid || isSubmitting" class="btn-primary">
            {{ isSubmitting ? 'Saving...' : (editMode ? 'Update' : 'Add') }} Ground
          </button>
          <button type="button" (click)="cancelEdit()" class="btn-secondary" *ngIf="editMode">
            Cancel
          </button>
        </div>
      </form>

      <hr />

      <!-- Ground List -->
      <div class="ground-list-section">
        <h2>Ground List</h2>
        <div class="ground-list">
          <div class="ground-card" *ngFor="let ground of grounds">
            <img [src]="ground.imageUrl || '/assets/images/turfs/default-turf.jpg'" alt="Ground" class="ground-img" />
            <div class="ground-info">
              <h3>{{ ground.name }}</h3>
              <p class="location">📍 {{ ground.address }}, {{ ground.city }}</p>
              <p class="description">{{ ground.description }}</p>
              <div class="ground-details">
                <span class="sport">{{ ground.sport }}</span>
                <span class="price">₹{{ ground.pricePerHour }}/hour</span>
                <span class="capacity">{{ ground.capacity }} players</span>
                <span class="status" [class.available]="ground.isAvailable" [class.unavailable]="!ground.isAvailable">
                  {{ ground.isAvailable ? 'Available' : 'Unavailable' }}
                </span>
              </div>
              <div class="timings-preview" *ngIf="ground.timings?.length">
                <strong>Timings:</strong>
                <div class="timing-tags">
                  <span *ngFor="let timing of ground.timings.slice(0, 3)" class="timing-tag">
                    {{ timing.dayOfWeek }} {{ timing.startTime }}-{{ timing.endTime }}
                  </span>
                  <span *ngIf="ground.timings.length > 3" class="timing-tag more">
                    +{{ ground.timings.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>
            <div class="ground-actions">
              <button (click)="editGround(ground)" class="btn-edit">Edit</button>
              <button (click)="deleteGround(ground.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>
        
        <div *ngIf="grounds.length === 0" class="no-grounds">
          <p>No grounds added yet. Add your first ground above!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ground-management-container { 
      max-width: 1200px; 
      margin: 2rem auto; 
      padding: 2rem; 
      background: #fff; 
      border-radius: 1rem; 
      box-shadow: 0 4px 16px rgba(0,0,0,0.08); 
    }

    h1 { 
      color: #2d3748; 
      margin-bottom: 2rem; 
      text-align: center; 
    }

    .form-section {
      background: #f8f9fa;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-section h3 {
      color: #4a5568;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .ground-form { 
      display: flex; 
      flex-direction: column; 
      gap: 1.5rem; 
      margin-bottom: 2rem; 
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group { 
      display: flex; 
      flex-direction: column; 
      gap: 0.5rem; 
    }

    .form-group label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    input, select, textarea { 
      padding: 0.75rem; 
      border-radius: 0.5rem; 
      border: 1px solid #d1d5db; 
      font-size: 1rem; 
      transition: border-color 0.2s;
    }

    input:focus, select:focus, textarea:focus {
      border-color: #667eea;
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error {
      color: #e53e3e;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .timing-item, .amenity-item {
      background: white;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #e2e8f0;
    }

    .btn-add {
      background: #48bb78;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      margin-top: 0.5rem;
    }

    .btn-remove {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn-primary { 
      background: #667eea; 
      color: #fff; 
      border: none; 
      padding: 0.75rem 2rem; 
      border-radius: 0.5rem; 
      font-weight: 600; 
      cursor: pointer; 
      font-size: 1rem;
    }

    .btn-primary:disabled { 
      background: #b3bcf5; 
      cursor: not-allowed; 
    }

    .btn-secondary {
      background: #718096;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
    }

    .ground-list-section h2 {
      color: #2d3748;
      margin-bottom: 1.5rem;
    }

    .ground-list { 
      display: grid; 
      gap: 1.5rem; 
    }

    .ground-card { 
      display: flex; 
      align-items: flex-start; 
      gap: 1.5rem; 
      background: #f8f9fa; 
      border-radius: 0.75rem; 
      padding: 1.5rem; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .ground-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .ground-img { 
      width: 120px; 
      height: 90px; 
      object-fit: cover; 
      border-radius: 0.5rem; 
      flex-shrink: 0;
    }

    .ground-info { 
      flex: 1; 
    }

    .ground-info h3 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
      font-size: 1.2rem;
    }

    .location {
      color: #667eea;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .description {
      color: #4a5568;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .ground-details {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .sport, .price, .capacity, .status { 
      padding: 0.25rem 0.75rem; 
      border-radius: 0.5rem; 
      font-size: 0.8rem; 
      font-weight: 500;
    }

    .sport { 
      background: #e0e7ff; 
      color: #3730a3; 
    }

    .price { 
      background: #dcfce7; 
      color: #166534; 
    }

    .capacity { 
      background: #fef3c7; 
      color: #92400e; 
    }

    .status.available { 
      background: #dcfce7; 
      color: #166534; 
    }

    .status.unavailable { 
      background: #fee2e2; 
      color: #991b1b; 
    }

    .timings-preview {
      margin-top: 0.5rem;
    }

    .timings-preview strong {
      font-size: 0.8rem;
      color: #4a5568;
    }

    .timing-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-top: 0.25rem;
    }

    .timing-tag {
      background: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
    }

    .timing-tag.more {
      background: #e2e8f0;
      color: #64748b;
    }

    .ground-actions { 
      display: flex; 
      flex-direction: column; 
      gap: 0.5rem; 
      flex-shrink: 0;
    }

    .btn-edit, .btn-delete { 
      background: #667eea; 
      color: #fff; 
      border: none; 
      padding: 0.5rem 1rem; 
      border-radius: 0.5rem; 
      font-weight: 500; 
      cursor: pointer; 
      font-size: 0.9rem;
    }

    .btn-delete { 
      background: #e53e3e; 
    }

    .no-grounds {
      text-align: center;
      color: #718096;
      padding: 3rem;
      background: #f8f9fa;
      border-radius: 0.75rem;
    }

    @media (max-width: 768px) {
      .ground-management-container {
        padding: 1rem;
        margin: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .ground-card {
        flex-direction: column;
        align-items: stretch;
      }

      .ground-img {
        width: 100%;
        height: 150px;
      }

      .ground-actions {
        flex-direction: row;
        justify-content: center;
      }
    }
  `]
})
export class GroundManagementComponent implements OnInit {
  groundForm: FormGroup;
  imagePreview: string | null = null;
  editMode = false;
  editId: string | null = null;
  grounds: Ground[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.groundForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      sportType: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      pricePerHour: ['', [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      isAvailable: [true],
      timings: this.fb.array([]),
      amenities: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadGrounds();
    this.addTiming(); // Add one default timing
    this.addAmenity(); // Add one default amenity
  }

  get timingsArray() {
    return this.groundForm.get('timings') as FormArray;
  }

  get amenitiesArray() {
    return this.groundForm.get('amenities') as FormArray;
  }

  addTiming() {
    const timing = this.fb.group({
      dayOfWeek: ['Monday', Validators.required],
      startTime: ['06:00', Validators.required],
      endTime: ['08:00', Validators.required],
      pricePerHour: ['', [Validators.required, Validators.min(0)]],
      isAvailable: [true]
    });
    this.timingsArray.push(timing);
  }

  removeTiming(index: number) {
    this.timingsArray.removeAt(index);
  }

  addAmenity() {
    const amenity = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      additionalCost: [0, [Validators.min(0)]],
      isAvailable: [true]
    });
    this.amenitiesArray.push(amenity);
  }

  removeAmenity(index: number) {
    this.amenitiesArray.removeAt(index);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.groundForm.patchValue({ imageUrl: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.groundForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.groundForm.value;

    try {
      if (this.editMode && this.editId) {
        // Update existing ground
        await this.http.put(`http://localhost:5048/api/turf/${this.editId}`, formValue).toPromise();
        this.editMode = false;
        this.editId = null;
      } else {
        // Create new ground
        await this.http.post('http://localhost:5048/api/turf', formValue).toPromise();
      }

      this.groundForm.reset();
      this.resetFormArrays();
      this.addTiming();
      this.addAmenity();
      this.loadGrounds();
    } catch (error) {
      console.error('Error saving ground:', error);
      // Handle error - show user feedback
    } finally {
      this.isSubmitting = false;
    }
  }

  resetFormArrays() {
    while (this.timingsArray.length !== 0) {
      this.timingsArray.removeAt(0);
    }
    while (this.amenitiesArray.length !== 0) {
      this.amenitiesArray.removeAt(0);
    }
  }

  async loadGrounds() {
    try {
      const response: any = await this.http.get('http://localhost:5048/api/turf').toPromise();
      this.grounds = response.map((turf: any) => ({
        id: turf.id.toString(),
        name: turf.name,
        location: turf.address,
        sport: turf.sportType,
        imageUrl: turf.imageUrl,
        pricePerHour: turf.pricePerHour,
        description: turf.description,
        address: turf.address,
        city: turf.city,
        capacity: turf.capacity,
        isAvailable: turf.isAvailable,
        timings: turf.timings || [],
        amenities: turf.amenities || []
      }));
    } catch (error) {
      console.error('Error loading grounds:', error);
      // Load fallback data
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
    this.grounds = [
      {
        id: '1',
        name: 'Premium Cricket Ground',
        location: 'Banjara Hills, Hyderabad',
        sport: 'Cricket',
        imageUrl: '/assets/images/turfs/cricket-ground.jpg',
        pricePerHour: 1200,
        description: 'Premium cricket ground with floodlights and changing rooms',
        address: 'Banjara Hills',
        city: 'Hyderabad',
        capacity: 22,
        isAvailable: true,
        timings: [
          { dayOfWeek: 'Monday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true },
          { dayOfWeek: 'Tuesday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true }
        ],
        amenities: [
          { name: 'Changing Room', description: 'Clean changing facilities', isAvailable: true, additionalCost: 0 },
          { name: 'Floodlights', description: 'Evening play available', isAvailable: true, additionalCost: 200 }
        ]
      }
    ];
  }

  editGround(ground: Ground) {
    this.editMode = true;
    this.editId = ground.id;
    
    this.resetFormArrays();
    
    this.groundForm.patchValue({
      name: ground.name,
      description: ground.description,
      address: ground.address,
      city: ground.city,
      postalCode: '500034', // Default value
      sportType: ground.sport,
      capacity: ground.capacity,
      pricePerHour: ground.pricePerHour,
      imageUrl: ground.imageUrl,
      isAvailable: ground.isAvailable
    });

    // Add timings
    if (ground.timings && ground.timings.length > 0) {
      ground.timings.forEach(timing => {
        const timingGroup = this.fb.group({
          dayOfWeek: [timing.dayOfWeek, Validators.required],
          startTime: [timing.startTime, Validators.required],
          endTime: [timing.endTime, Validators.required],
          pricePerHour: [timing.pricePerHour, [Validators.required, Validators.min(0)]],
          isAvailable: [timing.isAvailable]
        });
        this.timingsArray.push(timingGroup);
      });
    } else {
      this.addTiming();
    }

    // Add amenities
    if (ground.amenities && ground.amenities.length > 0) {
      ground.amenities.forEach(amenity => {
        const amenityGroup = this.fb.group({
          name: [amenity.name, Validators.required],
          description: [amenity.description || ''],
          additionalCost: [amenity.additionalCost || 0, [Validators.min(0)]],
          isAvailable: [amenity.isAvailable]
        });
        this.amenitiesArray.push(amenityGroup);
      });
    } else {
      this.addAmenity();
    }
  }

  async deleteGround(id: string) {
    if (confirm('Are you sure you want to delete this ground?')) {
      try {
        await this.http.delete(`http://localhost:5048/api/turf/${id}`).toPromise();
        this.loadGrounds();
        
        if (this.editId === id) {
          this.cancelEdit();
        }
      } catch (error) {
        console.error('Error deleting ground:', error);
      }
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.editId = null;
    this.groundForm.reset();
    this.resetFormArrays();
    this.addTiming();
    this.addAmenity();
  }
} 