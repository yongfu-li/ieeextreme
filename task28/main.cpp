#include <algorithm>
#include <array>
#include <iostream>
#include <utility>
#include <vector>

using namespace std;

struct Component {
    int parent = -1;
    int left = 0;
    int right = 0;
    int size_elements = 0;
    int trie_root = 0;
    int value_count = 0;
    int best = 0;
    vector<int> values;
};

struct BinaryTrie {
    static constexpr int MAX_BIT = 29;

    vector<array<int, 2>> next_node;

    BinaryTrie() {
        next_node.push_back({0, 0});
    }

    int new_node() {
        next_node.push_back({0, 0});
        return static_cast<int>(next_node.size()) - 1;
    }

    void insert(const int root, const int value) {
        int current = root;
        for (int bit = MAX_BIT; bit >= 0; --bit) {
            const int direction = (value >> bit) & 1;
            if (next_node[current][direction] == 0) {
                next_node[current][direction] = new_node();
            }
            current = next_node[current][direction];
        }
    }

    int query_max_xor(const int root, const int value) const {
        int current = root;
        int result = 0;
        for (int bit = MAX_BIT; bit >= 0; --bit) {
            const int direction = (value >> bit) & 1;
            const int preferred = direction ^ 1;
            if (next_node[current][preferred] != 0) {
                result |= (1 << bit);
                current = next_node[current][preferred];
            } else {
                current = next_node[current][direction];
            }
        }
        return result;
    }
};

static int find_root(vector<Component>& components, const int node) {
    if (components[node].parent == node) {
        return node;
    }
    components[node].parent = find_root(components, components[node].parent);
    return components[node].parent;
}

static void add_value(
    Component& component,
    BinaryTrie& trie,
    const int value
) {
    if (component.value_count > 0) {
        component.best = max(
            component.best,
            trie.query_max_xor(component.trie_root, value)
        );
    }
    trie.insert(component.trie_root, value);
    ++component.value_count;
    component.values.push_back(value);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;

    vector<int> array_values(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> array_values[i];
    }

    vector<int> removal_order(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> removal_order[i];
    }

    vector<int> prefix_xor(n + 1, 0);
    for (int i = 1; i <= n; ++i) {
        prefix_xor[i] = prefix_xor[i - 1] ^ array_values[i];
    }

    BinaryTrie trie;
    vector<Component> components(n + 2);
    vector<bool> is_active(n + 2, false);
    vector<int> answers_after_add(n + 1, 0);

    int global_best = 0;

    for (int step = 1; step <= n; ++step) {
        const int position = removal_order[n - step + 1];
        const bool left_active = (position > 1 && is_active[position - 1]);
        const bool right_active = (position < n && is_active[position + 1]);

        if (!left_active && !right_active) {
            Component fresh_component;
            fresh_component.parent = position;
            fresh_component.left = position;
            fresh_component.right = position;
            fresh_component.size_elements = 1;
            fresh_component.trie_root = trie.new_node();
            add_value(fresh_component, trie, prefix_xor[position - 1]);
            add_value(fresh_component, trie, prefix_xor[position]);
            components[position] = move(fresh_component);
        } else if (left_active && !right_active) {
            const int root = find_root(components, position - 1);
            components[position].parent = root;
            Component& component = components[root];
            component.right = position;
            ++component.size_elements;
            add_value(component, trie, prefix_xor[position]);
        } else if (!left_active && right_active) {
            const int root = find_root(components, position + 1);
            components[position].parent = root;
            Component& component = components[root];
            component.left = position;
            ++component.size_elements;
            add_value(component, trie, prefix_xor[position - 1]);
        } else {
            int left_root = find_root(components, position - 1);
            int right_root = find_root(components, position + 1);

            if (left_root == right_root) {
                components[position].parent = left_root;
                Component& component = components[left_root];
                ++component.size_elements;
            } else {
                if (components[left_root].values.size() < components[right_root].values.size()) {
                    swap(left_root, right_root);
                }

                Component& big_component = components[left_root];
                Component& small_component = components[right_root];

                big_component.best = max(big_component.best, small_component.best);
                for (const int value : small_component.values) {
                    big_component.best = max(
                        big_component.best,
                        trie.query_max_xor(big_component.trie_root, value)
                    );
                    trie.insert(big_component.trie_root, value);
                    ++big_component.value_count;
                    big_component.values.push_back(value);
                }

                big_component.left = min(big_component.left, small_component.left);
                big_component.right = max(big_component.right, small_component.right);
                big_component.size_elements += small_component.size_elements + 1;

                small_component.values.clear();
                small_component.value_count = 0;
                components[right_root].parent = left_root;
                components[position].parent = left_root;
            }
        }

        is_active[position] = true;
        const int current_root = find_root(components, position);
        global_best = max(global_best, components[current_root].best);
        answers_after_add[step] = global_best;
    }

    for (int i = n; i >= 1; --i) {
        cout << answers_after_add[i] << '\n';
    }

    return 0;
}
