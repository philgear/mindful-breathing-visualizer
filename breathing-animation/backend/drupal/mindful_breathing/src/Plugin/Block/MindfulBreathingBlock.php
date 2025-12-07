<?php

namespace Drupal\mindful_breathing\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Mindful Breathing' Block.
 *
 * @Block(
 *   id = "mindful_breathing_block",
 *   admin_label = @Translation("Mindful Breathing Widget"),
 *   category = @Translation("Wellness"),
 * )
 */
class MindfulBreathingBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'mindful_breathing_block',
      '#technique' => 'box', // Default
      '#attached' => [
        'library' => [
          'mindful_breathing/mindful_breathing',
        ],
      ],
      // SECURITY: Add Cache Contexts to ensure permission changes are respected.
      '#cache' => [
         'contexts' => ['user.permissions'],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(\Drupal\Core\Session\AccountInterface $account) {
    // SECURITY: Explicitly check if the user has permission to view this content.
    // relying on default 'view block' is okay, but explicit naming is safer for custom logic.
    return \Drupal\Core\Access\AccessResult::allowedIfHasPermission($account, 'access content');
  }

}
