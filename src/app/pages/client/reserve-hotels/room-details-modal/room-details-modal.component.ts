import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Room } from '../../../../core/models/room.model';

@Component({
    selector: 'app-room-details-modal',
    templateUrl: './room-details-modal.component.html',
    styleUrls: ['./room-details-modal.component.scss']
})
export class RoomDetailsModalComponent {
    @Input() room: Room | null = null;
    @Output() closeModal = new EventEmitter<void>();

    currentRoomImageIndex = 0;

    close(): void {
        this.closeModal.emit();
    }

    prevRoomImage(): void {
        if (!this.room) return;
        if (this.currentRoomImageIndex > 0) {
            this.currentRoomImageIndex--;
        } else {
            this.currentRoomImageIndex = this.room.images.length - 1;
        }
    }

    nextRoomImage(): void {
        if (!this.room) return;
        if (this.currentRoomImageIndex < this.room.images.length - 1) {
            this.currentRoomImageIndex++;
        } else {
            this.currentRoomImageIndex = 0;
        }
    }

    goToRoomImage(index: number): void {
        this.currentRoomImageIndex = index;
    }
}
